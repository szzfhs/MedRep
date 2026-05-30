import { ref, onMounted } from 'vue'
import { getAllTenants } from '@/api/simhub/tenant'

/**
 * 获取租户下拉列表选项的公共 composable
 * 用于在各管理页面显示"所属学校"筛选器
 */
export function useTenantOptions() {
  const tenantOptions = ref([])

  const loadTenants = async () => {
    try {
      const res = await getAllTenants()
      tenantOptions.value = res.data || []
    } catch (e) {
      tenantOptions.value = []
    }
  }

  onMounted(loadTenants)

  return { tenantOptions }
}
