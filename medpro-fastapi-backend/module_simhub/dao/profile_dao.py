"""SimHub 学生/教师扩展信息 DAO"""
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from module_simhub.entity.do.simhub_do import VfStudentProfile, VfTeacherProfile


class StudentProfileDao:
    @classmethod
    async def get_by_user_id(cls, db: AsyncSession, user_id: int) -> VfStudentProfile | None:
        result = await db.execute(
            select(VfStudentProfile).where(VfStudentProfile.user_id == user_id)
        )
        return result.scalars().first()

    @classmethod
    async def upsert(cls, db: AsyncSession, user_id: int, data: dict) -> VfStudentProfile:
        existing = await cls.get_by_user_id(db, user_id)
        if existing is None:
            profile = VfStudentProfile(user_id=user_id, **data)
            db.add(profile)
            await db.flush()
            return profile
        else:
            await db.execute(
                update(VfStudentProfile).where(VfStudentProfile.user_id == user_id).values(**data)
            )
            await db.flush()
            return await cls.get_by_user_id(db, user_id)  # type: ignore[return-value]


class TeacherProfileDao:
    @classmethod
    async def get_by_user_id(cls, db: AsyncSession, user_id: int) -> VfTeacherProfile | None:
        result = await db.execute(
            select(VfTeacherProfile).where(VfTeacherProfile.user_id == user_id)
        )
        return result.scalars().first()

    @classmethod
    async def upsert(cls, db: AsyncSession, user_id: int, data: dict) -> VfTeacherProfile:
        existing = await cls.get_by_user_id(db, user_id)
        if existing is None:
            profile = VfTeacherProfile(user_id=user_id, **data)
            db.add(profile)
            await db.flush()
            return profile
        else:
            await db.execute(
                update(VfTeacherProfile).where(VfTeacherProfile.user_id == user_id).values(**data)
            )
            await db.flush()
            return await cls.get_by_user_id(db, user_id)  # type: ignore[return-value]
