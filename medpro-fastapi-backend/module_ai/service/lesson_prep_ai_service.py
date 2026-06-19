"""
备课AI生成服务层

使用系统默认启用的AI模型（状态为 '1' 的第一条），通过 agno Agent 进行流式内容生成。
"""

import json
import os
import uuid
from collections.abc import AsyncGenerator
from typing import Literal

from agno.agent import Agent
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config.env import UploadConfig
from module_ai.entity.do.ai_model_do import AiModels
from module_simhub.dao.resource_dao import ResourceDao
from utils.ai_util import AiUtil
from utils.crypto_util import CryptoUtil
from utils.log_util import logger


async def _get_default_model(db: AsyncSession) -> AiModels | None:
    """获取第一个启用的AI模型（status='0' 表示正常/启用）"""
    result = await db.execute(select(AiModels).where(AiModels.status == '0').order_by(AiModels.model_sort).limit(1))
    return result.scalars().first()


async def _run_agent_stream(db: AsyncSession, system_prompt: str, user_prompt: str) -> AsyncGenerator[str, None]:
    """
    通用流式 Agent 运行器

    :param db: ORM会话
    :param system_prompt: 系统提示词
    :param user_prompt: 用户提示词
    :return: 文本块异步生成器
    """
    model_do = await _get_default_model(db)
    if not model_do:
        yield 'data: [ERROR] 未找到可用的AI模型，请在系统设置中添加并启用AI模型\n\n'
        return

    try:
        real_api_key = CryptoUtil.decrypt(model_do.api_key) if model_do.api_key else ''
        model = AiUtil.get_model_from_factory(
            provider=model_do.provider,
            model_code=model_do.model_code,
            model_name=model_do.model_name,
            api_key=real_api_key,
            base_url=model_do.base_url,
            temperature=model_do.temperature or 0.7,
            max_tokens=model_do.max_tokens or 4096,
        )
    except Exception as e:
        logger.error(f'AI模型初始化失败: {e}')
        yield f'data: [ERROR] AI模型初始化失败: {e}\n\n'
        return

    agent = Agent(model=model, description=system_prompt, markdown=False)

    try:
        async for chunk in agent.arun(user_prompt, stream=True, stream_events=False):
            # chunk is RunResponse with .content attribute
            content = getattr(chunk, 'content', None) or ''
            if content:
                yield f'data: {content}\n\n'
    except Exception as e:
        logger.error(f'AI生成失败: {e}')
        yield f'data: [ERROR] 生成失败: {e}\n\n'


class LessonPrepAiService:
    """
    备课AI生成服务
    """

    @classmethod
    async def generate_course_info(cls, db: AsyncSession, topic: str) -> AsyncGenerator[str, None]:
        """
        流式生成课程基本信息

        :param db: ORM会话
        :param topic: 课程主题
        :return: SSE文本流
        """
        system_prompt = (
            '你是一位专业的医学教育课程设计专家，擅长为虚拟仿真实验课程设计课程大纲和教学方案。'
            '请用中文回答，内容专业、简洁、适合高等医学教育。'
        )
        user_prompt = (
            f'请为主题为「{topic}」的医学虚拟仿真实验课程生成课程基本信息，包括：\n'
            '1. 推荐课程名称（一个）\n'
            '2. 课程简介（150字以内）\n'
            '3. 学习收获（3-5条，每条一行）\n'
            '4. 推荐总学时（数字）\n'
            '5. 课程类别（理论课/实验课/综合课 三选一）\n\n'
            '请直接输出内容，不要加额外说明。'
        )
        async for chunk in _run_agent_stream(db, system_prompt, user_prompt):
            yield chunk

    @classmethod
    async def generate_outline(cls, db: AsyncSession, course_name: str, total_sections: int = 5) -> AsyncGenerator[str, None]:
        """
        流式生成课程大纲JSON

        :param db: ORM会话
        :param course_name: 课程名称
        :param total_sections: 目标章节数
        :return: SSE文本流（JSON格式大纲）
        """
        system_prompt = (
            '你是一位专业的医学教育课程设计专家。'
            '请严格按照要求的JSON格式输出，不要加任何Markdown代码块标记，不要加任何额外说明。'
        )
        user_prompt = (
            f'请为课程「{course_name}」生成包含{total_sections}个章节的课程大纲。\n'
            '输出格式为JSON数组，每个章节包含以下字段：\n'
            '- id: 字符串，格式为 "ch_1"、"ch_2" 等\n'
            '- title: 章节标题\n'
            '- hours: 该章节学时数（整数）\n'
            '- children: 数组，包含2-4个小节，每个小节有 id（格式 "s_1_1"）、title、hours 字段\n\n'
            '示例格式：\n'
            '[{"id":"ch_1","title":"第一章 基础知识","hours":4,"children":['
            '{"id":"s_1_1","title":"1.1 解剖结构","hours":2},'
            '{"id":"s_1_2","title":"1.2 生理功能","hours":2}]}]\n\n'
            '请直接输出JSON，不包含任何其他内容。'
        )
        async for chunk in _run_agent_stream(db, system_prompt, user_prompt):
            yield chunk

    @classmethod
    async def generate_md_content(cls, db: AsyncSession, section_title: str, course_name: str = '') -> AsyncGenerator[str, None]:
        """
        流式生成小节教案Markdown内容

        :param db: ORM会话
        :param section_title: 小节标题
        :param course_name: 所属课程名称（可选）
        :return: SSE文本流（Markdown格式）
        """
        ctx = f'所属课程：{course_name}，' if course_name else ''
        system_prompt = (
            '你是一位专业的医学教育教师，擅长撰写虚拟仿真实验课程的教学方案。'
            '请用Markdown格式输出教案内容，内容专业准确，适合高等医学教育。'
        )
        user_prompt = (
            f'请为{ctx}小节「{section_title}」编写详细教案，包含以下内容：\n'
            '## 教学目标\n（知识目标、技能目标、素养目标各2-3条）\n\n'
            '## 教学重点与难点\n\n'
            '## 教学内容\n（详细知识点讲解，500-800字）\n\n'
            '## 教学活动设计\n（互动环节、虚拟仿真操作步骤）\n\n'
            '## 课后作业\n（2-3道思考题）\n\n'
            '请直接输出Markdown内容。'
        )
        async for chunk in _run_agent_stream(db, system_prompt, user_prompt):
            yield chunk

    @classmethod
    async def generate_quiz(cls, db: AsyncSession, section_title: str, count: int = 5) -> list[dict]:
        """
        生成试题JSON列表（非流式）

        :param db: ORM会话
        :param section_title: 小节标题
        :param count: 试题数量
        :return: 试题列表
        """
        model_do = await _get_default_model(db)
        if not model_do:
            return []

        try:
            real_api_key = CryptoUtil.decrypt(model_do.api_key) if model_do.api_key else ''
            model = AiUtil.get_model_from_factory(
                provider=model_do.provider,
                model_code=model_do.model_code,
                model_name=model_do.model_name,
                api_key=real_api_key,
                base_url=model_do.base_url,
                temperature=0.5,
                max_tokens=model_do.max_tokens or 4096,
            )
        except Exception as e:
            logger.error(f'AI模型初始化失败: {e}')
            return []

        system_prompt = (
            '你是一位医学考试命题专家。请严格按照JSON格式输出，不要加任何Markdown标记或额外说明。'
        )
        user_prompt = (
            f'请为「{section_title}」生成{count}道选择题，输出JSON数组，每题包含：\n'
            '- question: 题目\n'
            '- options: 四个选项对象数组，每项含 key("A"/"B"/"C"/"D") 和 value\n'
            '- answer: 正确答案键（"A"/"B"/"C"/"D"）\n'
            '- explanation: 解析（50字以内）\n\n'
            '示例：[{"question":"...","options":[{"key":"A","value":"..."}],"answer":"A","explanation":"..."}]\n'
            '请直接输出JSON数组。'
        )

        agent = Agent(model=model, description=system_prompt, markdown=False)
        try:
            response = await agent.arun(user_prompt, stream=False)
            content = response.content if response else ''
            # Strip potential markdown code block
            content = content.strip()
            if content.startswith('```'):
                content = content.split('\n', 1)[-1]
                content = content.rsplit('```', 1)[0]
            return json.loads(content)
        except Exception as e:
            logger.error(f'AI生成试题失败: {e}')
            return []

    @classmethod
    async def generate_experiment_md(cls, db: AsyncSession, section_title: str, course_name: str = '') -> AsyncGenerator[str, None]:
        """
        流式生成实验操作指导 Markdown 文档

        :param db: ORM会话
        :param section_title: 实验小节标题
        :param course_name: 课程名称（可选）
        :return: SSE文本流（Markdown格式）
        """
        ctx = f'所属课程：{course_name}，' if course_name else ''
        system_prompt = (
            '你是一位医学虚拟仿真实验指导教师，擅长编写结构清晰、步骤详细的实验操作指南。'
            '请用Markdown格式输出，内容专业，强调操作规范和安全注意事项。'
        )
        user_prompt = (
            f'请为{ctx}实验小节「{section_title}」编写完整的实验指导文档，包含：\n'
            '## 实验目的\n（3-4条学习目标）\n\n'
            '## 实验器材与环境\n（设备、材料、虚拟仿真平台要求）\n\n'
            '## 实验原理\n（核心医学知识背景，200字以内）\n\n'
            '## 实验步骤\n（分步骤详细操作说明，每步骤说明预期结果）\n\n'
            '## 注意事项\n（安全规范、常见错误提示）\n\n'
            '## 实验记录表格\n（用Markdown表格设计记录表单）\n\n'
            '## 思考题\n（2-3道，引导深入思考）\n\n'
            '请直接输出Markdown内容。'
        )
        async for chunk in _run_agent_stream(db, system_prompt, user_prompt):
            yield chunk

    @classmethod
    async def general_chat(
        cls,
        db: AsyncSession,
        messages: list[dict],
        system_hint: str = '',
    ) -> AsyncGenerator[str, None]:
        """
        通用多轮对话（取最近消息 + 历史摘要做上下文）

        :param db: ORM会话
        :param messages: [{role:'user'|'assistant', content:str}, ...]
        :param system_hint: 可选的系统提示追加
        :return: SSE文本流
        """
        system_prompt = (
            '你是一位专业的医学教育AI助手，擅长课程设计、教学内容生成和教学策略建议。'
            '请用中文简洁专业地回答，如有代码或格式化内容请用Markdown输出。'
        )
        if system_hint:
            system_prompt += f'\n{system_hint}'

        # 构建历史上下文
        history_parts: list[str] = []
        for msg in messages[:-1][-6:]:  # 最近6条历史
            role_label = '用户' if msg.get('role') == 'user' else '助手'
            history_parts.append(f'{role_label}：{msg.get("content", "")}')

        last_user_msg = next(
            (m['content'] for m in reversed(messages) if m.get('role') == 'user'),
            '',
        )
        history_ctx = '\n'.join(history_parts)
        history_prefix = ('历史对话：\n' + history_ctx + '\n\n') if history_ctx else ''
        user_prompt = (
            f'{history_prefix}'
            f'用户最新问题：{last_user_msg}'
        )

        async for chunk in _run_agent_stream(db, system_prompt, user_prompt):
            yield chunk

    @classmethod
    async def optimize_outline(
        cls,
        db: AsyncSession,
        outline: list[dict],
        course_name: str = '',
    ) -> AsyncGenerator[str, None]:
        """
        对已有大纲进行 AI 分析与优化建议

        :param db: ORM会话
        :param outline: 大纲 JSON 树（OutlineNode[]）
        :param course_name: 课程名称
        :return: SSE文本流（Markdown格式分析报告）
        """
        outline_text = json.dumps(outline, ensure_ascii=False, indent=2)
        ctx = f'课程「{course_name}」' if course_name else '该课程'
        system_prompt = (
            '你是一位资深医学教育课程专家，擅长评估课程大纲的合理性和完整性。'
            '请用Markdown格式输出分析报告，评价客观，建议具体可行。'
        )
        user_prompt = (
            f'请对以下{ctx}的课程大纲进行专业评估，大纲JSON如下：\n\n'
            f'```json\n{outline_text[:3000]}\n```\n\n'
            '请从以下维度进行分析并给出具体建议：\n\n'
            '## 大纲结构评估\n（章节数量、层级深度、结构合理性）\n\n'
            '## 学时分配分析\n（各章节学时是否合理，是否平衡）\n\n'
            '## 知识覆盖完整性\n（针对医学教育，是否有遗漏的重要知识点）\n\n'
            '## 逻辑递进性\n（前后章节的逻辑关系是否清晰，难度递进是否合理）\n\n'
            '## 优化建议\n（具体的修改建议，包括增删章节、调整顺序等）\n\n'
            '请直接输出Markdown分析报告。'
        )
        async for chunk in _run_agent_stream(db, system_prompt, user_prompt):
            yield chunk

    @classmethod
    async def generate_slide_html(cls, db: AsyncSession, section_title: str, md_content: str = '') -> AsyncGenerator[str, None]:
        """
        流式生成简易HTML幻灯片

        :param db: ORM会话
        :param section_title: 小节标题
        :param md_content: 教案Markdown内容（可选）
        :return: SSE文本流（HTML格式）
        """
        content_hint = f'\n参考教案内容：\n{md_content[:1500]}' if md_content else ''
        system_prompt = (
            '你是一位前端开发工程师，擅长生成简洁美观的HTML幻灯片。'
            '请输出完整可运行的单页HTML，使用内联CSS，风格简洁专业，适合医学教学场景。'
            '不要加任何Markdown标记，直接输出HTML代码。'
        )
        user_prompt = (
            f'请为小节「{section_title}」生成一个简洁的HTML演示幻灯片，包含4-6张幻灯片。{content_hint}\n\n'
            '要求：使用纯HTML+CSS，深色系配色，每张幻灯片用 <section class="slide"> 包裹，'
            '包含标题、要点列表或图示说明，底部有页码。请直接输出完整HTML文档。'
        )
        async for chunk in _run_agent_stream(db, system_prompt, user_prompt):
            yield chunk

    @classmethod
    async def save_ai_generated_resource(
        cls,
        db: AsyncSession,
        create_by: str,
        resource_name: str,
        content: str,
        content_type: Literal['md', 'html', 'quiz_json'],
        resource_type: str = 'lesson_plan',
        section_id: int | None = None,
    ) -> dict:
        """
        将AI生成的内容写入文件并创建 vf_resource 记录，可选自动绑定到章节。

        :param db: ORM会话
        :param create_by: 创建用户名
        :param resource_name: 资源名称
        :param content: 文件内容（文本）
        :param content_type: 内容类型 md/html/quiz_json
        :param resource_type: 资源类型（lesson_plan/courseware/extension）
        :param section_id: 可选，自动绑定到该章节
        :return: { resourceId, fileUrl }
        """
        from module_simhub.dao.course_dao import CourseDao

        # 1. 确定文件扩展名
        ext_map = {'md': 'md', 'html': 'html', 'quiz_json': 'json'}
        ext = ext_map.get(content_type, 'txt')
        file_format = ext

        # 2. 写入文件
        ai_gen_dir = os.path.join(UploadConfig.UPLOAD_PATH, 'ai-gen')
        os.makedirs(ai_gen_dir, exist_ok=True)
        file_uuid = str(uuid.uuid4()).replace('-', '')
        file_name = f'{file_uuid}.{ext}'
        file_path = os.path.join(ai_gen_dir, file_name)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        file_url = f'{UploadConfig.UPLOAD_PREFIX}/ai-gen/{file_name}'
        file_size = len(content.encode('utf-8'))

        # 3. 创建 vf_resource 记录
        resource_data = {
            'resource_name': resource_name,
            'resource_type': resource_type,
            'file_url': file_url,
            'file_format': file_format,
            'file_size': file_size,
            'description': f'AI生成内容（{content_type}）',
            'allow_download': '0',
            'status': '0',
        }
        resource = await ResourceDao.add_resource(db, create_by, resource_data)

        # 4. 如果传入 section_id，自动绑定
        if section_id:
            try:
                await CourseDao.add_section_resource(db, section_id, resource.resource_id)
            except Exception as e:
                logger.warning(f'自动绑定章节资源失败（section_id={section_id}）: {e}')

        await db.commit()
        logger.info(f'AI生成资源已保存：{file_url}，resource_id={resource.resource_id}')
        return {'resourceId': resource.resource_id, 'fileUrl': file_url}

    @classmethod
    async def generate_scene_outlines(
        cls,
        db: AsyncSession,
        section_title: str,
        course_name: str = '',
        scene_count: int = 6,
    ) -> AsyncGenerator[str, None]:
        """
        流式生成场景大纲列表（SSE），逐个输出 SceneOutline JSON 对象。

        SSE 事件格式：
          data: {"type":"outline","data":{...SceneOutline...},"index":0}
          data: {"type":"done","total":N}

        :param db: ORM会话
        :param section_title: 章节标题
        :param course_name: 课程名称（可选）
        :param scene_count: 目标场景数量
        :return: SSE 文本流
        """
        ctx = f'所属课程「{course_name}」，' if course_name else ''
        system_prompt = (
            '你是一位医学教育课程设计专家，擅长为虚拟仿真实验课设计多样化的教学场景。'
            '请严格按照JSON格式输出场景大纲数组，不要包含任何Markdown标记或额外说明。\n'
            '场景类型说明：\n'
            '  slide - 讲解幻灯片（理论知识传授）\n'
            '  quiz - 知识测验（选择题/判断题）\n'
            '  interactive - 交互操作（虚拟仿真步骤演练）\n'
            '  pbl - 问题导向学习（案例分析）'
        )
        user_prompt = (
            f'请为{ctx}章节「{section_title}」设计{scene_count}个教学场景大纲。\n'
            '输出格式为JSON数组，每个场景包含以下字段：\n'
            '- id: 字符串，格式为 "scene_1"、"scene_2" 等\n'
            '- type: 场景类型（slide/quiz/interactive/pbl 之一）\n'
            '- title: 场景标题\n'
            '- description: 场景描述（50字以内）\n'
            '- keyPoints: 关键知识点数组（2-4条）\n'
            '- teachingObjective: 教学目标（一句话）\n'
            '- order: 场景顺序（从1开始）\n\n'
            '请直接输出JSON数组，确保场景类型多样化，覆盖理论、实践、测验、PBL。'
        )

        # 收集完整响应后逐个解析并流式输出
        full_response = ''
        async for chunk in _run_agent_stream(db, system_prompt, user_prompt):
            # chunk 格式: "data: {content}\n\n"
            content = chunk
            if content.startswith('data: '):
                content = content[6:]
            content = content.rstrip('\n')
            if content.startswith('[ERROR]'):
                yield f'data: {json.dumps({"type": "error", "message": content}, ensure_ascii=False)}\n\n'
                return
            full_response += content

        # 解析完整 JSON 并逐个流出
        try:
            full_response = full_response.strip()
            if full_response.startswith('```'):
                full_response = full_response.split('\n', 1)[-1]
                full_response = full_response.rsplit('```', 1)[0]
            outlines: list[dict] = json.loads(full_response)
            for idx, outline in enumerate(outlines):
                event = json.dumps({'type': 'outline', 'data': outline, 'index': idx}, ensure_ascii=False)
                yield f'data: {event}\n\n'
            yield f'data: {json.dumps({"type": "done", "total": len(outlines)}, ensure_ascii=False)}\n\n'
        except Exception as e:
            logger.error(f'场景大纲JSON解析失败: {e}, raw={full_response[:200]}')
            yield f'data: {json.dumps({"type": "error", "message": f"JSON解析失败: {e}"}, ensure_ascii=False)}\n\n'

    @classmethod
    async def generate_scene_content(
        cls,
        db: AsyncSession,
        outline: dict,
        all_outlines: list[dict],
        section_title: str = '',
    ) -> dict:
        """
        根据场景大纲生成对应的场景内容（非流式，返回 JSON）。

        根据 outline.type 分支处理：
          slide → 幻灯片布局JSON
          quiz  → 测验题目数组
          interactive → 交互步骤JSON
          pbl   → PBL案例JSON

        :param db: ORM会话
        :param outline: 单个场景大纲对象
        :param all_outlines: 所有场景大纲（提供上下文）
        :param section_title: 章节标题
        :return: 场景内容字典
        """
        model_do = await _get_default_model(db)
        if not model_do:
            return {'error': '未找到可用的AI模型'}

        try:
            real_api_key = CryptoUtil.decrypt(model_do.api_key) if model_do.api_key else ''
            model = AiUtil.get_model_from_factory(
                provider=model_do.provider,
                model_code=model_do.model_code,
                model_name=model_do.model_name,
                api_key=real_api_key,
                base_url=model_do.base_url,
                temperature=0.6,
                max_tokens=model_do.max_tokens or 4096,
            )
        except Exception as e:
            logger.error(f'AI模型初始化失败: {e}')
            return {'error': f'AI模型初始化失败: {e}'}

        scene_type = outline.get('type', 'slide')
        scene_title = outline.get('title', '')
        key_points = outline.get('keyPoints', [])
        objective = outline.get('teachingObjective', '')
        context = f'章节「{section_title}」，' if section_title else ''

        system_prompt = (
            '你是一位医学教育内容设计专家。请严格按照JSON格式输出，不要加任何Markdown标记。'
        )

        if scene_type == 'slide':
            user_prompt = (
                f'请为{context}场景「{scene_title}」生成幻灯片内容JSON。\n'
                f'关键知识点：{key_points}\n教学目标：{objective}\n\n'
                '输出格式：\n'
                '{"slides": [{"slideIndex":1,"layoutType":"title","title":"...","subtitle":"..."},'
                '{"slideIndex":2,"layoutType":"bullets","title":"...","bullets":["...","..."]},'
                '{"slideIndex":3,"layoutType":"split","title":"...","leftText":"...","rightText":"..."}]}'
            )
        elif scene_type == 'quiz':
            user_prompt = (
                f'请为{context}场景「{scene_title}」生成4道选择题。\n'
                f'关键知识点：{key_points}\n\n'
                '输出格式：\n'
                '{"questions":[{"id":"q1","question":"...","options":[{"key":"A","value":"..."}],'
                '"answer":"A","explanation":"..."}]}'
            )
        elif scene_type == 'interactive':
            user_prompt = (
                f'请为{context}场景「{scene_title}」设计虚拟仿真交互步骤。\n'
                f'关键知识点：{key_points}\n教学目标：{objective}\n\n'
                '输出格式：\n'
                '{"steps":[{"stepIndex":1,"action":"观察","instruction":"...","expectedResult":"...",'
                '"hint":"..."}]}'
            )
        else:  # pbl
            user_prompt = (
                f'请为{context}场景「{scene_title}」设计一个PBL案例。\n'
                f'关键知识点：{key_points}\n教学目标：{objective}\n\n'
                '输出格式：\n'
                '{"caseTitle":"...","background":"...","problem":"...","tasks":["任务1","任务2"],'
                '"resources":["参考文献1"],"discussionPoints":["讨论点1","讨论点2"],"summary":"..."}'
            )

        agent = Agent(model=model, description=system_prompt, markdown=False)
        try:
            response = await agent.arun(user_prompt, stream=False)
            content = response.content if response else '{}'
            content = content.strip()
            if content.startswith('```'):
                content = content.split('\n', 1)[-1]
                content = content.rsplit('```', 1)[0]
            return json.loads(content)
        except Exception as e:
            logger.error(f'场景内容生成失败: {e}')
            return {'error': f'生成失败: {e}'}
