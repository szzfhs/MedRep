<template>
  <div class="min-h-screen flex items-center justify-center px-6">
    <div class="text-center">
      <div class="text-8xl font-extrabold font-headline text-primary/20 mb-4">404</div>
      <h1 class="text-3xl font-bold font-headline text-on-surface mb-3">页面不存在</h1>
      <p class="text-slate-400 mb-8">您访问的页面已被移除或从未存在</p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <router-link to="/" class="btn-primary">返回首页</router-link>
        <button class="btn-outline" @click="$router.back()">返回上一页</button>
      </div>
    </div>
  </div>
</template>
