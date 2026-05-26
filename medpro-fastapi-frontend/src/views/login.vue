<template>
  <div class="login">
    <!-- 背景装饰圆 -->
    <div class="login-bg-deco">
      <div class="deco-circle deco-circle--1"></div>
      <div class="deco-circle deco-circle--2"></div>
      <div class="deco-circle deco-circle--3"></div>
    </div>

    <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
      <!-- 品牌头部 -->
      <div class="login-header">
        <div class="login-brand-icon">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="10" fill="url(#brand-grad)"/>
            <path d="M20 8v24M8 20h24" stroke="white" stroke-width="4" stroke-linecap="round"/>
            <defs>
              <linearGradient id="brand-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#1E88E5"/>
                <stop offset="100%" stop-color="#00897B"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h2 class="login-brand-title">{{ title }}</h2>
        <p class="login-brand-subtitle">心血管介入虚拟仿真教学平台</p>
      </div>

      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          type="text"
          size="large"
          auto-complete="off"
          placeholder="账号"
        >
          <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          size="large"
          auto-complete="off"
          placeholder="密码"
          @keyup.enter="handleLogin"
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code" v-if="captchaEnabled">
        <el-input
          v-model="loginForm.code"
          size="large"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter="handleLogin"
        >
          <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
        </el-input>
        <div class="login-code">
          <img :src="codeUrl" @click="getCode" class="login-code-img"/>
        </div>
      </el-form-item>
      <el-checkbox v-model="loginForm.rememberMe" style="margin:0px 0px 20px 0px;">记住密码</el-checkbox>
      <el-form-item style="width:100%;">
        <el-button
          :loading="loading"
          size="large"
          type="primary"
          style="width:100%;"
          @click.prevent="handleLogin"
        >
          <span v-if="!loading">登  录</span>
          <span v-else>登 录 中...</span>
        </el-button>
        <div style="float: right; margin-top: 8px;" v-if="register">
          <router-link class="link-type" :to="'/register'">立即注册</router-link>
        </div>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-login-footer">
      <span>{{ footerContent }}</span>
    </div>
  </div>
</template>

<script setup>
import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";
import useUserStore from '@/store/modules/user'
import defaultSettings from '@/settings'

const title = import.meta.env.VITE_APP_TITLE;
const footerContent = defaultSettings.footerContent
const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance();

const loginForm = ref({
  username: "",
  password: "",
  rememberMe: false,
  code: "",
  uuid: ""
});

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
};

const codeUrl = ref("");
const loading = ref(false);
// 验证码开关
const captchaEnabled = ref(true);
// 注册开关
const register = ref(false);
const redirect = ref(undefined);

watch(route, (newRoute) => {
    redirect.value = newRoute.query && newRoute.query.redirect;
}, { immediate: true });

function handleLogin() {
  proxy.$refs.loginRef.validate(valid => {
    if (valid) {
      loading.value = true;
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 });
        Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 });
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 });
      } else {
        // 否则移除
        Cookies.remove("username");
        Cookies.remove("password");
        Cookies.remove("rememberMe");
      }
      // 调用action的登录方法
      userStore.login(loginForm.value).then(() => {
        const query = route.query;
        const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
          if (cur !== "redirect") {
            acc[cur] = query[cur];
          }
          return acc;
        }, {});
        router.push({ path: redirect.value || "/", query: otherQueryParams });
      }).catch(() => {
        loading.value = false;
        // 重新获取验证码
        if (captchaEnabled.value) {
          getCode();
        }
      });
    }
  });
}

function getCode() {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled;
    register.value = res.registerEnabled === undefined ? false : res.registerEnabled;
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img;
      loginForm.value.uuid = res.uuid;
    }
  });
}

function getCookie() {
  const username = Cookies.get("username");
  const password = Cookies.get("password");
  const rememberMe = Cookies.get("rememberMe");
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
  };
}

getCode();
getCookie();
</script>

<style lang='scss' scoped>
// ── 全屏容器 ────────────────────────────────
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 100vh;
  background-image:
    linear-gradient(135deg, rgba(11,25,41,0.88) 0%, rgba(11,83,148,0.75) 50%, rgba(0,137,123,0.65) 100%),
    url("../assets/images/login-background.jpg");
  background-size: cover;
  background-position: center;
  overflow: hidden;
  position: relative;
}

html.dark .login {
  background-image:
    linear-gradient(135deg, rgba(0,0,0,0.92) 0%, rgba(11,83,148,0.6) 50%, rgba(0,0,0,0.85) 100%),
    url("../assets/images/login-background.jpg");
}

// ── 背景装饰圆 ───────────────────────────
.login-bg-deco {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.12;

  &--1 {
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, #1E88E5 0%, transparent 70%);
    top: -180px;
    right: -120px;
  }

  &--2 {
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, #00897B 0%, transparent 70%);
    bottom: -100px;
    left: -80px;
  }

  &--3 {
    width: 250px;
    height: 250px;
    background: radial-gradient(circle, #0B5394 0%, transparent 70%);
    top: 40%;
    left: 20%;
    opacity: 0.08;
  }
}

// ── 登录卡片 ────────────────────────────
.login-form {
  position: relative;
  z-index: 10;
  width: 420px;
  padding: 36px 36px 24px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow:
    0 24px 64px rgba(11, 25, 41, 0.35),
    0 4px 16px rgba(11, 83, 148, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.6);

  // 卡片顶部品牌色条
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #0B5394 0%, #1E88E5 50%, #00897B 100%);
    border-radius: 20px 20px 0 0;
  }

  .el-input {
    height: 40px;
    input { height: 40px; }
  }

  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0px;
  }
}

html.dark .login-form {
  background: rgba(20, 20, 20, 0.9);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
}

// ── 品牌头部 ────────────────────────────
.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.login-brand-icon {
  width: 56px;
  height: 56px;
  margin-bottom: 14px;
  filter: drop-shadow(0 4px 12px rgba(30, 136, 229, 0.4));

  svg { width: 100%; height: 100%; }
}

.login-brand-title {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 800;
  color: #0B1929;
  letter-spacing: 0.5px;
  line-height: 1.2;
  text-align: center;
}

.login-brand-subtitle {
  margin: 0;
  font-size: 12px;
  color: #64748B;
  letter-spacing: 1px;
  text-align: center;
}

html.dark .login-brand-title { color: #F1F5F9; }
html.dark .login-brand-subtitle { color: #94A3B8; }

// ── 验证码区域 ─────────────────────────
.login-code {
  width: 33%;
  height: 40px;
  float: right;
  img { cursor: pointer; vertical-align: middle; border-radius: 8px; }
}

.login-code-img {
  height: 40px;
  padding-left: 8px;
  border-radius: 8px;
}

// ── 底部版权 ────────────────────────────
.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  letter-spacing: 1px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}
</style>
