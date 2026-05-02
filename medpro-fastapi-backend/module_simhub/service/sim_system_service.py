"""SimHub 实验系统 Service"""
from sqlalchemy.ext.asyncio import AsyncSession

from common.vo import CrudResponseModel, PageModel
from module_simhub.dao.sim_system_dao import SimSystemDao, SimSystemImageDao
from module_simhub.entity.vo.sim_system_vo import (
    AddSimSystemModel,
    DeleteSimSystemModel,
    EditSimSystemModel,
    SimSystemModel,
    SimSystemPageQueryModel,
)


class SimSystemService:
    @classmethod
    async def get_sim_system_list(cls, db: AsyncSession, query: SimSystemPageQueryModel) -> PageModel:
        page = await SimSystemDao.get_sim_system_list(db, query)
        page.rows = [SimSystemModel.model_validate(r).model_dump(by_alias=True) for r in page.rows]
        return page

    @classmethod
    async def get_portal_sim_system_list(cls, db: AsyncSession, query: SimSystemPageQueryModel) -> PageModel:
        """门户公开接口：仅返回启用系统，附带封面图集和关联实验数"""
        # 强制只查启用状态（admin 约定：'1'=启用）
        query.status = '1'
        page = await SimSystemDao.get_sim_system_list(db, query)
        sim_ids = [r.sim_system_id for r in page.rows]

        # 批量查图集
        images_map: dict[int, list[str]] = {}
        for sid in sim_ids:
            imgs = await SimSystemImageDao.get_images_by_system(db, sid)
            images_map[sid] = [img.image_url for img in imgs]

        # 批量查关联实验数
        exp_counts = await SimSystemDao.get_exp_counts(db, sim_ids)

        rows = []
        for r in page.rows:
            data = SimSystemModel.model_validate(r).model_dump(by_alias=True)
            sid = r.sim_system_id
            data['images'] = images_map.get(sid, [])
            data['expCount'] = exp_counts.get(sid, 0)
            rows.append(data)
        page.rows = rows
        return page

    @classmethod
    async def get_sim_system_detail(
        cls, db: AsyncSession, sim_system_id: int, incr_view: bool = False
    ) -> dict | None:
        sim = await SimSystemDao.get_sim_system_by_id(db, sim_system_id)
        if sim is None:
            return None
        # 在 commit 之前序列化，避免 commit 导致对象 expired 后 lazy-load 触发 MissingGreenlet 错误
        data = SimSystemModel.model_validate(sim).model_dump(by_alias=True)
        if incr_view:
            await SimSystemDao.increment_view(db, sim_system_id)
            await db.commit()
        # 附加图集列表
        images = await SimSystemImageDao.get_images_by_system(db, sim_system_id)
        data['images'] = [img.image_url for img in images]
        return data

    @classmethod
    async def add_sim_system(
        cls, db: AsyncSession, create_by: str, data: AddSimSystemModel
    ) -> CrudResponseModel:
        images = data.images or []
        create_data = data.model_dump(exclude={'images'}, exclude_none=True, by_alias=False)
        sim = await SimSystemDao.add_sim_system(db, create_by, create_data)
        if images:
            await SimSystemImageDao.add_images(db, sim.sim_system_id, images)  # type: ignore[arg-type]
        await db.commit()
        return CrudResponseModel(is_success=True, message='新增成功')

    @classmethod
    async def edit_sim_system(
        cls, db: AsyncSession, update_by: str, data: EditSimSystemModel
    ) -> CrudResponseModel:
        sim = await SimSystemDao.get_sim_system_by_id(db, data.sim_system_id)
        if not sim:
            return CrudResponseModel(is_success=False, message='实验系统不存在')
        images = data.images
        update_data = data.model_dump(exclude={'sim_system_id', 'images'}, exclude_none=True, by_alias=False)
        await SimSystemDao.edit_sim_system(db, update_by, data.sim_system_id, update_data)
        # 图集全量更新
        if images is not None:
            await SimSystemImageDao.delete_images_by_system(db, data.sim_system_id)
            if images:
                await SimSystemImageDao.add_images(db, data.sim_system_id, images)
        await db.commit()
        return CrudResponseModel(is_success=True, message='更新成功')

    @classmethod
    async def delete_sim_system(
        cls, db: AsyncSession, data: DeleteSimSystemModel
    ) -> CrudResponseModel:
        ids = [int(i) for i in data.sim_system_ids.split(',') if i.strip().isdigit()]
        if not ids:
            return CrudResponseModel(is_success=False, message='ID参数无效')
        await SimSystemDao.delete_sim_system(db, ids)
        await db.commit()
        return CrudResponseModel(is_success=True, message='删除成功')

    @classmethod
    async def get_all_active(cls, db: AsyncSession) -> list[dict]:
        """获取所有启用的实验系统（用于下拉选择）"""
        items = await SimSystemDao.get_all_active(db)
        return [
            {'simSystemId': item.sim_system_id, 'systemName': item.system_name}
            for item in items
        ]
