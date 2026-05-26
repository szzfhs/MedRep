import request from '@/lib/request';

export interface CaptchaResponse {
  captchaEnabled: boolean;
  registerEnabled: boolean;
  img: string;       // base64 image
  uuid: string;      // captcha session id
}

export interface LoginParams {
  username: string;
  password: string;
  code?: string;
  uuid?: string;
}

export interface LoginTokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserInfo {
  user: {
    userId: number;
    userName: string;
    nickName: string;
    email?: string;
    phonenumber?: string;
    sex?: string;
    avatar?: string;
    deptId?: number;
  };
  roles: string[];
  permissions: string[];
}

export interface RegisterParams {
  username: string;
  password: string;
  confirmPassword: string;
  code?: string;
  uuid?: string;
}

// 获取验证码图片
export async function getCaptchaImage(): Promise<CaptchaResponse> {
  const res = await request.get('/captchaImage');
  return res.data.data;
}

// 登录（使用 multipart/form-data，与后端 OAuth2PasswordRequestForm 兼容）
export async function login(params: LoginParams): Promise<string> {
  const formData = new FormData();
  formData.append('username', params.username);
  formData.append('password', params.password);
  if (params.code) formData.append('code', params.code);
  if (params.uuid) formData.append('uuid', params.uuid);

  const res = await request.post('/login', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  // 后端使用 dict_content 直接合并到根对象，返回结构：{ code, msg, token, success }
  return res.data.token;
}

// 获取当前用户信息（需要 token）
export async function getInfo(): Promise<UserInfo> {
  const res = await request.get('/getInfo');
  // 后端使用 model_content 直接合并到根对象，返回结构：{ code, permissions, roles, user, ... }
  return res.data;
}

// 注册
export async function register(params: RegisterParams): Promise<void> {
  await request.post('/register', params);
}

// 登出
export async function logout(): Promise<void> {
  await request.post('/logout');
}
