from collections.abc import AsyncGenerator
from typing import Annotated, Literal

from fastapi import Body, Request, Response
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from common.aspect.db_seesion import DBSessionDependency
from common.aspect.pre_auth import CurrentUserDependency, PreAuthDependency
from common.router import APIRouterPro
from module_admin.entity.vo.user_vo import CurrentUserModel
from module_ai.service.lesson_prep_ai_service import LessonPrepAiService
from utils.log_util import logger
from utils.response_util import ResponseUtil

lesson_prep_ai_controller = APIRouterPro(
    prefix='/ai/lesson-prep',
    order_num=21,
    tags=['AI管理-备课AI生成'],
    dependencies=[PreAuthDependency()],
)


@lesson_prep_ai_controller.post(
    '/generate-course-info',
    summary='AI生成课程基本信息',
    description='根据课程主题流式生成课程名称、简介、学习收获等信息',
    response_class=StreamingResponse,
    responses={200: {'description': '流式返回生成内容', 'content': {'text/event-stream': {}}}},
)
async def generate_course_info(
    request: Request,
    body: Annotated[dict, Body()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> StreamingResponse:
    topic: str = body.get('topic', '')
    logger.info(f'用户{current_user.user.user_id} AI生成课程信息，主题：{topic}')
    stream = LessonPrepAiService.generate_course_info(query_db, topic)
    return StreamingResponse(content=stream, media_type='text/event-stream')


@lesson_prep_ai_controller.post(
    '/generate-outline',
    summary='AI生成课程大纲',
    description='根据课程名称流式生成章节大纲JSON',
    response_class=StreamingResponse,
    responses={200: {'description': '流式返回大纲JSON', 'content': {'text/event-stream': {}}}},
)
async def generate_outline(
    request: Request,
    body: Annotated[dict, Body()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> StreamingResponse:
    course_name: str = body.get('courseName', '')
    total_sections: int = int(body.get('totalSections', 5))
    logger.info(f'用户{current_user.user.user_id} AI生成大纲，课程：{course_name}')
    stream = LessonPrepAiService.generate_outline(query_db, course_name, total_sections)
    return StreamingResponse(content=stream, media_type='text/event-stream')


@lesson_prep_ai_controller.post(
    '/generate-md-content',
    summary='AI生成小节教案',
    description='根据小节标题流式生成Markdown格式教学内容',
    response_class=StreamingResponse,
    responses={200: {'description': '流式返回Markdown内容', 'content': {'text/event-stream': {}}}},
)
async def generate_md_content(
    request: Request,
    body: Annotated[dict, Body()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> StreamingResponse:
    section_title: str = body.get('sectionTitle', '')
    course_name: str = body.get('courseName', '')
    logger.info(f'用户{current_user.user.user_id} AI生成教案内容，小节：{section_title}')
    stream = LessonPrepAiService.generate_md_content(query_db, section_title, course_name)
    return StreamingResponse(content=stream, media_type='text/event-stream')


@lesson_prep_ai_controller.post(
    '/generate-quiz',
    summary='AI生成试题',
    description='根据小节标题生成JSON格式试题列表',
)
async def generate_quiz(
    request: Request,
    body: Annotated[dict, Body()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    from utils.response_util import ResponseUtil

    section_title: str = body.get('sectionTitle', '')
    count: int = int(body.get('count', 5))
    logger.info(f'用户{current_user.user.user_id} AI生成试题，小节：{section_title}')
    questions = await LessonPrepAiService.generate_quiz(query_db, section_title, count)
    return ResponseUtil.success(data=questions)


@lesson_prep_ai_controller.post(
    '/generate-slide-html',
    summary='AI生成幻灯片HTML',
    description='根据小节教案内容流式生成简易HTML幻灯片',
    response_class=StreamingResponse,
    responses={200: {'description': '流式返回HTML内容', 'content': {'text/event-stream': {}}}},
)
async def generate_slide_html(
    request: Request,
    body: Annotated[dict, Body()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> StreamingResponse:
    section_title: str = body.get('sectionTitle', '')
    md_content: str = body.get('mdContent', '')
    logger.info(f'用户{current_user.user.user_id} AI生成幻灯片，小节：{section_title}')
    stream = LessonPrepAiService.generate_slide_html(query_db, section_title, md_content)
    return StreamingResponse(content=stream, media_type='text/event-stream')


@lesson_prep_ai_controller.post(
    '/generate-experiment-md',
    summary='AI生成实验操作指导文档',
    description='根据实验小节标题流式生成Markdown格式实验指导文档',
    response_class=StreamingResponse,
    responses={200: {'description': '流式返回Markdown内容', 'content': {'text/event-stream': {}}}},
)
async def generate_experiment_md(
    request: Request,
    body: Annotated[dict, Body()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> StreamingResponse:
    section_title: str = body.get('sectionTitle', '')
    course_name: str = body.get('courseName', '')
    logger.info(f'用户{current_user.user.user_id} AI生成实验文档，小节：{section_title}')
    stream = LessonPrepAiService.generate_experiment_md(query_db, section_title, course_name)
    return StreamingResponse(content=stream, media_type='text/event-stream')


@lesson_prep_ai_controller.post(
    '/general-chat',
    summary='通用AI对话',
    description='多轮对话，SSE流式返回',
    response_class=StreamingResponse,
    responses={200: {'description': '流式返回对话内容', 'content': {'text/event-stream': {}}}},
)
async def general_chat(
    request: Request,
    body: Annotated[dict, Body()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> StreamingResponse:
    messages: list[dict] = body.get('messages', [])
    system_hint: str = body.get('systemHint', '')
    logger.info(f'用户{current_user.user.user_id} 通用AI对话，消息数：{len(messages)}')
    stream = LessonPrepAiService.general_chat(query_db, messages, system_hint)
    return StreamingResponse(content=stream, media_type='text/event-stream')


@lesson_prep_ai_controller.post(
    '/optimize-outline',
    summary='AI大纲优化建议',
    description='对现有大纲进行AI分析，流式返回优化建议',
    response_class=StreamingResponse,
    responses={200: {'description': '流式返回Markdown分析报告', 'content': {'text/event-stream': {}}}},
)
async def optimize_outline(
    request: Request,
    body: Annotated[dict, Body()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> StreamingResponse:
    outline: list[dict] = body.get('outline', [])
    course_name: str = body.get('courseName', '')
    logger.info(f'用户{current_user.user.user_id} AI大纲优化，课程：{course_name}')
    stream = LessonPrepAiService.optimize_outline(query_db, outline, course_name)
    return StreamingResponse(content=stream, media_type='text/event-stream')


@lesson_prep_ai_controller.post(
    '/save-resource',
    summary='保存AI生成内容为教学资源',
    description='将AI生成的MD/HTML/JSON内容写入文件并创建 vf_resource 记录，可选自动绑定到章节',
)
async def save_ai_resource(
    request: Request,
    body: Annotated[dict, Body()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
):
    resource_name: str = body.get('resourceName', 'AI生成资源')
    content: str = body.get('content', '')
    content_type: str = body.get('contentType', 'md')
    resource_type: str = body.get('resourceType', 'lesson_plan')
    section_id: int | None = body.get('sectionId')
    create_by: str = current_user.user.user_name or str(current_user.user.user_id)

    if not content:
        return ResponseUtil.failure(msg='内容不能为空')

    logger.info(f'用户{create_by} 保存AI生成资源：{resource_name}，类型：{content_type}')
    try:
        result = await LessonPrepAiService.save_ai_generated_resource(
            db=query_db,
            create_by=create_by,
            resource_name=resource_name,
            content=content,
            content_type=content_type,
            resource_type=resource_type,
            section_id=section_id,
        )
        return ResponseUtil.success(data=result)
    except Exception as e:
        logger.error(f'保存AI生成资源失败: {e}')
        return ResponseUtil.error(msg=f'保存失败: {e}')


@lesson_prep_ai_controller.post(
    '/generate-scene-outlines',
    summary='AI流式生成场景大纲',
    description='为章节生成多个教学场景大纲（SSE流式，逐个输出SceneOutline JSON）',
    response_class=StreamingResponse,
    responses={200: {'description': '流式返回场景大纲事件', 'content': {'text/event-stream': {}}}},
)
async def generate_scene_outlines(
    request: Request,
    body: Annotated[dict, Body()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> StreamingResponse:
    section_title: str = body.get('sectionTitle', '')
    course_name: str = body.get('courseName', '')
    scene_count: int = int(body.get('sceneCount', 6))
    logger.info(f'用户{current_user.user.user_id} AI生成场景大纲，章节：{section_title}')
    stream = LessonPrepAiService.generate_scene_outlines(query_db, section_title, course_name, scene_count)
    return StreamingResponse(content=stream, media_type='text/event-stream')


@lesson_prep_ai_controller.post(
    '/generate-scene-content',
    summary='AI生成场景内容',
    description='根据场景大纲生成对应的幻灯片/测验/交互/PBL内容（同步JSON返回）',
)
async def generate_scene_content(
    request: Request,
    body: Annotated[dict, Body()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
):
    outline: dict = body.get('outline', {})
    all_outlines: list[dict] = body.get('allOutlines', [])
    section_title: str = body.get('sectionTitle', '')
    logger.info(f'用户{current_user.user.user_id} AI生成场景内容，场景：{outline.get("title")}')
    result = await LessonPrepAiService.generate_scene_content(query_db, outline, all_outlines, section_title)
    if 'error' in result:
        return ResponseUtil.error(msg=result['error'])
    return ResponseUtil.success(data=result)

