import request from '@/utils/request'

// 查询新闻列表
export function listNews(query) {
  return request({ url: '/simhub/news/list', method: 'get', params: query })
}

// 查询新闻详情
export function getNews(newsId) {
  return request({ url: '/simhub/news/' + newsId, method: 'get' })
}

// 新增新闻
export function addNews(data) {
  return request({ url: '/simhub/news', method: 'post', data })
}

// 修改新闻
export function updateNews(data) {
  return request({ url: '/simhub/news', method: 'put', data })
}

// 删除新闻
export function delNews(newsIds) {
  return request({ url: '/simhub/news/' + newsIds, method: 'delete' })
}
