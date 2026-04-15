"""SimHub 虚拟实验 Service"""
from sqlalchemy.ext.asyncio import AsyncSession

from common.vo import CrudResponseModel, PageModel
from module_simhub.dao.experiment_dao import (
    ExperimentCategoryDao,
    ExperimentDao,
    ParticipationDao,
)
from module_simhub.entity.do.simhub_do import VfExperiment, VfExperimentCategory
from module_simhub.entity.vo.experiment_vo import (
    AddExperimentCategoryModel,
    AddExperimentModel,
    DeleteExperimentModel,
    EditExperimentCategoryModel,
    EditExperimentModel,
    ExperimentCategoryModel,
    ExperimentModel,
    ExperimentPageQueryModel,
)


def _build_category_tree(categories: list[VfExperimentCategory], parent_id: int = 0) -> list[dict]:
    result = []
    for cat in categories:
        if (cat.parent_id or 0) == parent_id:
            node = ExperimentCategoryModel.model_validate(cat).model_dump(by_alias=True)
            children = _build_category_tree(categories, cat.category_id)  # type: ignore[arg-type]
            if children:
                node['children'] = children
            result.append(node)
    return result


class ExperimentService:
    @classmethod
    async def get_category_tree(cls, db: AsyncSession) -> list[dict]:
        categories = await ExperimentCategoryDao.get_all_categories(db)
        return _build_category_tree(categories)

    @classmethod
    async def add_category(cls, db: AsyncSession, data: AddExperimentCategoryModel) -> CrudResponseModel:
        await ExperimentCategoryDao.add_category(db, data.model_dump(exclude_none=True, by_alias=False))
        await db.commit()
        return CrudResponseModel(is_success=True, message='新增成功')

    @classmethod
    async def edit_category(cls, db: AsyncSession, data: EditExperimentCategoryModel) -> CrudResponseModel:
        cat = await ExperimentCategoryDao.get_category_by_id(db, data.category_id)
        if not cat:
            return CrudResponseModel(is_success=False, message='分类不存在')
        update_data = data.model_dump(exclude={'category_id'}, exclude_none=True, by_alias=False)
        await ExperimentCategoryDao.edit_category(db, data.category_id, update_data)
        await db.commit()
        return CrudResponseModel(is_success=True, message='更新成功')

    @classmethod
    async def delete_category(cls, db: AsyncSession, category_id: int) -> CrudResponseModel:
        await ExperimentCategoryDao.delete_category(db, category_id)
        await db.commit()
        return CrudResponseModel(is_success=True, message='删除成功')

    @classmethod
    async def get_experiment_list(cls, db: AsyncSession, query: ExperimentPageQueryModel) -> PageModel:
        page = await ExperimentDao.get_experiment_list(db, query)
        page.rows = [ExperimentModel.model_validate(r).model_dump(by_alias=True) for r in page.rows]
        return page

    @classmethod
    async def get_experiment_detail(
        cls, db: AsyncSession, exp_id: int, incr_view: bool = False
    ) -> dict | None:
        exp = await ExperimentDao.get_experiment_by_id(db, exp_id)
        if exp is None:
            return None
        if incr_view:
            await ExperimentDao.increment_view(db, exp_id)
        return ExperimentModel.model_validate(exp).model_dump(by_alias=True)

    @classmethod
    async def add_experiment(cls, db: AsyncSession, create_by: str, data: AddExperimentModel) -> CrudResponseModel:
        exp_data = data.model_dump(exclude_none=True, by_alias=False)
        await ExperimentDao.add_experiment(db, create_by, exp_data)
        await db.commit()
        return CrudResponseModel(is_success=True, message='新增成功')

    @classmethod
    async def edit_experiment(cls, db: AsyncSession, update_by: str, data: EditExperimentModel) -> CrudResponseModel:
        exp = await ExperimentDao.get_experiment_by_id(db, data.exp_id)
        if not exp:
            return CrudResponseModel(is_success=False, message='实验不存在')
        update_data = data.model_dump(exclude={'exp_id'}, exclude_none=True, by_alias=False)
        await ExperimentDao.edit_experiment(db, update_by, data.exp_id, update_data)
        await db.commit()
        return CrudResponseModel(is_success=True, message='更新成功')

    @classmethod
    async def delete_experiment(cls, db: AsyncSession, data: DeleteExperimentModel) -> CrudResponseModel:
        ids = [int(i) for i in data.exp_ids.split(',')]
        await ExperimentDao.delete_experiment(db, ids)
        await db.commit()
        return CrudResponseModel(is_success=True, message='删除成功')

    @classmethod
    async def participate(cls, db: AsyncSession, user_id: int, exp_id: int) -> CrudResponseModel:
        exp = await ExperimentDao.get_experiment_by_id(db, exp_id)
        if not exp:
            return CrudResponseModel(is_success=False, message='实验不存在')
        await ParticipationDao.add_participation(db, user_id, exp_id)
        await ExperimentDao.increment_participate(db, exp_id)
        return CrudResponseModel(is_success=True, message='记录成功')
