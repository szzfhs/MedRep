"""SimHub 新闻 Service"""
from sqlalchemy.ext.asyncio import AsyncSession

from common.vo import CrudResponseModel, PageModel
from module_simhub.dao.news_dao import NewsDao
from module_simhub.entity.do.simhub_do import VfNews
from module_simhub.entity.vo.news_vo import (
    AddNewsModel,
    DeleteNewsModel,
    EditNewsModel,
    NewsModel,
    NewsPageQueryModel,
)


class NewsService:
    @classmethod
    async def get_news_list(cls, db: AsyncSession, query: NewsPageQueryModel) -> PageModel:
        page = await NewsDao.get_news_list(db, query)
        page.rows = [NewsModel.model_validate(r).model_dump(by_alias=True) for r in page.rows]
        return page

    @classmethod
    async def get_news_detail(cls, db: AsyncSession, news_id: int) -> dict | None:
        news = await NewsDao.get_news_by_id(db, news_id)
        if news is None:
            return None
        await NewsDao.increment_view(db, news_id)
        return NewsModel.model_validate(news).model_dump(by_alias=True)

    @classmethod
    async def add_news(cls, db: AsyncSession, create_by: str, data: AddNewsModel) -> CrudResponseModel:
        news_data = data.model_dump(exclude_none=True, by_alias=False)
        await NewsDao.add_news(db, create_by, news_data)
        await db.commit()
        return CrudResponseModel(is_success=True, message='新增成功')

    @classmethod
    async def edit_news(cls, db: AsyncSession, update_by: str, data: EditNewsModel) -> CrudResponseModel:
        news = await NewsDao.get_news_by_id(db, data.news_id)
        if not news:
            return CrudResponseModel(is_success=False, message='新闻不存在')
        update_data = data.model_dump(exclude={'news_id'}, exclude_none=True, by_alias=False)
        await NewsDao.edit_news(db, update_by, data.news_id, update_data)
        await db.commit()
        return CrudResponseModel(is_success=True, message='更新成功')

    @classmethod
    async def delete_news(cls, db: AsyncSession, data: DeleteNewsModel) -> CrudResponseModel:
        ids = [int(i) for i in data.news_ids.split(',')]
        await NewsDao.delete_news(db, ids)
        await db.commit()
        return CrudResponseModel(is_success=True, message='删除成功')
