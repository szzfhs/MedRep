<template>
  <footer class="bg-primary text-white mt-16">
    <div class="max-w-7xl mx-auto px-6 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 class="text-xl font-extrabold font-headline mb-4">SimHub</h3>
          <p class="text-blue-200 text-sm leading-relaxed">虚拟仿真实验教学平台，提供沉浸式的数字化实验学习体验。</p>
        </div>
        <div>
          <h4 class="font-bold mb-3 font-headline">快速导航</h4>
          <ul class="space-y-2 text-sm text-blue-200">
            <li v-for="item in links" :key="item.to">
              <router-link :to="item.to" class="hover:text-white transition-colors">{{ item.label }}</router-link>
            </li>
          </ul>
        </div>
        <div>
          <h4 class="font-bold mb-3 font-headline">新闻动态</h4>
          <ul class="space-y-2 text-sm text-blue-200">
            <li><router-link to="/news" class="hover:text-white transition-colors">新闻列表</router-link></li>
            <li><router-link to="/regulation" class="hover:text-white transition-colors">规章制度</router-link></li>
          </ul>
        </div>
        <div>
          <h4 class="font-bold mb-3 font-headline">联系我们</h4>
          <p class="text-sm text-blue-200">如有问题，请联系管理员。</p>
        </div>
      </div>
      <div class="border-t border-blue-800 mt-8 pt-6 text-center text-sm text-blue-300">
        © {{ new Date().getFullYear() }} SimHub 虚拟仿真实验教学平台
      </div>
    </div>
  </footer>
</template>

<script setup>
const links = [
  { to: '/', label: '首页' },
  { to: '/experiment', label: '实验大厅' },
  { to: '/course', label: '课程中心' },
  { to: '/resource', label: '资源中心' },
  { to: '/about', label: '关于中心' }
]
</script>
