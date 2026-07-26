<script setup lang="ts">
withDefaults(defineProps<{
  name?: string
  count?: number
}>(), {
  name: '',
  count: 0,
})
</script>

<template>
  <div
    :style="{
      position: 'relative',
      width: '1200px',
      height: '630px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: '#1F4B7A',
      fontFamily: 'Noto Sans JP, sans-serif',
      padding: '64px 80px',
    }"
  >
    <!-- 湯呑み柄の背景 -->
    <img src="/og-bg.png" :style="{ position: 'absolute', top: '0', left: '0', width: '1200px', height: '630px' }" />

    <!-- 左上ロゴ -->
    <div :style="{ position: 'absolute', top: '48px', left: '80px', display: 'flex', alignItems: 'center' }">
      <img src="/og-yunomi.png" width="38" height="50" />
      <div :style="{ marginLeft: '14px', fontSize: '30px', fontWeight: 700, color: '#ffffff' }">ユーノーミー</div>
    </div>

    <!-- 宛名 -->
    <div :style="{ display: 'flex', fontSize: '40px', fontWeight: 700, color: '#D4A857' }">
      {{ name }}さんへ
    </div>
    <!-- メイン -->
    <div :style="{ display: 'flex', fontSize: '76px', fontWeight: 700, color: '#ffffff', lineHeight: 1.25, marginTop: '12px' }">
      エピソードが届いています
    </div>
    <!-- 補足 -->
    <div :style="{ display: 'flex', fontSize: '32px', color: '#C9D6E5', marginTop: '24px' }">
      {{ count > 0 ? `知人があなたについて書いた紹介が${count}件` : '知人があなたについて書いてくれました' }}
    </div>
  </div>
</template>
