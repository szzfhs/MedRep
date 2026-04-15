"""SimHub 资源 Service"""
from sqlalchemy.ext.asyncio import AsyncSession

from common.vo import CrudResponseModel, PageModel
from module_simhub.dao.resource_dao import ResourceCategoryDao, ResourceDao
from module_simhub.entity.do.simhub_do import VfResourceCategory
from module_simhub.entity.vo.resource_vo import (
    AddResourceModel,
    DeleteResourceModel,
    EditResourceModel,
    ResourceCategoryModel,
    ResourceModel,
    ResourcePageQueryModel,
)


def _build_resource_category_tree(
    categories: list[VfResourceCategory], parent_id: int = 0
) -> list[dict]:
    result = []
    for c in categories:
        if (c.parent_id or 0) == parent_id:
            node = ResourceCategoryModel.model_validate(c).model_dump(by_alias=True)
            children = _build_resource_category_tree(categories, c.category_id)  # type: ignore[arg-type]
            if children:
                node['children'] = children
            result.append(node)
    return result


class ResourceService:
    @classmethod
    async def get_category_tree(cls, db: AsyncSession) -> list[dict]:
        categories = await ResourceCategoryDao.get_all_categories(db)
        return _build_resource_category_tree(categories)

    @classmethod
    async def add_category(cls, db: AsyncSession, create_by: str, data: dict) -> CrudResponseModel:
        await ResourceCategoryDao.add_category(db, data)
        await db.commit()
        return CrudResponseModel(is_success=True, message='新增成功')

    @classmethod
    async def edit_category(
        cls, db: AsyncSession, update_by: str, category_id: int, data: dict
    ) -> CrudResponseModel:
        cat = await ResourceCategoryDao.get_category_by_id(db, category_id)
        if not cat:
            return CrudResponseModel(is_success=False, message='分类不存在')
        await ResourceCategoryDao.edit_category(db, update_by, category_id, data)
        await db.commit()
        return CrudResponseModel(is_success=True, message='更新成功')

    @classmethod
    async def delete_category(cls, db: AsyncSession, category_id: int) -> CrudResponseModel:
        await ResourceCategoryDao.delete_category(db, category_id)
        await db.commit()
        return CrudResponseModel(is_success=True, message='删除成功')

    @classmethod
    async def get_resource_list(cls, db: AsyncSession, query: ResourcePageQueryModel) -> PageModel:
        page = await ResourceDao.get_resource_list(db, query)
        page.rows = [ResourceModel.model_validate(r).model_dump(by_alias=True) for r in page.rows]
        return page

    @classmethod
    async def get_resource_by_id(cls, db: AsyncSession, resource_id: int) -> dict | None:
        obj = await ResourceDao.get_resource_by_id(db, resource_id)
        if obj is None:
            return None
        return ResourceModel.model_validate(obj).model_dump(by_alias=True)

    @classmethod
    async def add_resource(
        cls, db: AsyncSession, create_by: str, data: AddResourceModel
    ) -> CrudResponseModel:
        resource_data = data.model_dump(exclude_none=True, by_alias=False)
        await ResourceDao.add_resource(db, create_by, resource_data)
        await db.commit()
        return CrudResponseModel(is_success=True, message='新增成功')

    @classmethod
    async def edit_resource(
        cls, db: AsyncSession, update_by: str, data: EditResourceModel
    ) -> CrudResponseModel:
        resource = await ResourceDao.get_resource_by_id(db, data.resource_id)
        if not resource:
            return CrudResponseModel(is_success=False, message='资源不存在')
        update_data = data.model_dump(exclude={'resource_id'}, exclude_none=True, by_alias=False)
        await ResourceDao.edit_resource(db, update_by, data.resource_id, update_data)
        await db.commit()
        return CrudResponseModel(is_success=True, message='更新成功')

    @classmethod
    async def delete_resource(cls, db: AsyncSession, data: DeleteResourceModel) -> CrudResponseModel:
        ids = [int(i) for i in data.resource_ids.split(',')]
        await ResourceDao.delete_resource(db, ids)
        await db.commit()
        return CrudResponseModel(is_success=True, message='删除成功')

    @classmethod
    async def increment_view(cls, db: AsyncSession, resource_id: int) -> None:
        await ResourceDao.increment_view_count(db, resource_id)

    @classmethod
    async def increment_download(cls, db: AsyncSession, resource_id: int) -> None:
        await ResourceDao.increment_download_count(db, resource_id)
