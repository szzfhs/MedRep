import request from '@/lib/request';

export interface UploadResult {
  fileName: string | null;
  newFileName: string | null;
  originalFilename: string | null;
  url: string | null;
}

/**
 * 通用图片上传，返回文件 URL
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await request.post<{ code: number; data: UploadResult }>('/common/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const url = res.data?.data?.url;
  if (!url) throw new Error('上传失败：未返回文件 URL');
  return url;
}
