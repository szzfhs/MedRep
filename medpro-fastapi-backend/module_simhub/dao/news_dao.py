"""SimHub 新闻 DAO"""
from datetime import datetime

from sqlalchemy import delete, desc, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from common.vo import PageModel
from module_simhub.entity.do.simhub_do import VfNews
from module_simhub.entity.vo.news_vo import NewsPageQueryModel
from utils.page_util import PageUtil


class NewsDao:
    @classmethod
    async def get_news_list(
        cls, db: AsyncSession, query: NewsPageQueryModel
    ) -> PageModel:
        conditions = [VfNews.del_flag == '0']
        if query.title:
            conditions.append(VfNews.title.like(f'%{query.title}%'))
        if query.status:
            conditions.append(VfNews.status == query.status)
        if query.begin_time:
            conditions.append(VfNews.create_time >= query.begin_time)
        if query.end_time:
            conditions.append(VfNews.create_time <= query.end_time)

        count_result = await db.execute(select(func.count()).where(*conditions))
        total = count_result.scalar() or 0

        offset = (query.page_num - 1) * query.page_size
        rows_result = await db.execute(
            select(VfNews)
            .where(*conditions)
            .order_by(desc(VfNews.create_time))
            .offset(offset)
            .limit(query.page_size)
        )
        rows = rows_result.scalars().all()
        import math
        has_next = math.ceil(total / query.page_size) > query.page_num if query.page_size > 0 else False
        return PageModel(rows=rows, pageNum=query.page_num, pageSize=query.page_size, total=total, hasNext=has_next)

    @classmethod
    async def get_news_by_id(cls, db: AsyncSession, news_id: int) -> VfNews | None:
        result = await db.execute(
            select(VfNews).where(VfNews.news_id == news_id, VfNews.del_flag == '0')
        )
        return result.scalars().first()

    @classmethod
    async def add_news(cls, db: AsyncSession, create_by: str, data: dict) -> VfNews:
        news = VfNews(**data, create_by=create_by, create_time=datetime.now())
        db.add(news)
        await db.flush()
        return news

    @classmethod
    async def edit_news(cls, db: AsyncSession, update_by: str, news_id: int, data: dict) -> None:
        data['update_by'] = update_by
        data['update_time'] = datetime.now()
        await db.execute(update(VfNews).where(VfNews.news_id == news_id).values(**data))
        await db.flush()

    @classmethod
    async def delete_news(cls, db: AsyncSession, news_ids: list[int]) -> None:
        await db.execute(
            update(VfNews).where(VfNews.news_id.in_(news_ids)).values(del_flag='2')
        )
        await db.flush()

    @classmethod
    async def increment_view(cls, db: AsyncSession, news_id: int) -> None:
        news = await cls.get_news_by_id(db, news_id)
        if news:
            await db.execute(
                update(VfNews).where(VfNews.news_id == news_id).values(view_count=VfNews.view_count + 1)
            )
            await db.flush()
