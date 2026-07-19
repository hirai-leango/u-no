<template>
  <div class="min-h-screen bg-surface-deep text-ink font-sans">
    <header class="border-b border-surface-border">
      <div class="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2 text-brand font-bold text-lg tracking-tight">
          <img src="/favicon.svg" alt="ユーノーミー" class="w-6 h-8" style="image-rendering: pixelated;" />
          ユーノーミー
        </NuxtLink>
        <nav v-if="user" class="relative flex items-center" ref="menuRef">
          <button
            class="flex items-center gap-1.5"
            @click="menuOpen = !menuOpen"
          >
            <img
              v-if="user.photoURL"
              :src="user.photoURL"
              class="w-8 h-8 rounded-full cursor-pointer hover:ring-2 ring-brand transition-all"
            />
            <Icon name="heroicons:chevron-down-20-solid" class="text-ink-mute text-base transition-transform" :class="menuOpen ? 'rotate-180' : ''" />
          </button>

          <div
            v-if="menuOpen"
            class="absolute right-0 top-11 w-52 bg-white border border-surface-border rounded-lg shadow-lg py-1.5 z-20"
          >
            <NuxtLink
              :to="`/u/${userSlug}/`"
              class="block px-4 py-2.5 text-sm text-ink hover:bg-brand/5 transition-colors"
              @click="menuOpen = false"
            >
              マイページ
            </NuxtLink>
            <NuxtLink
              to="/settings/"
              class="block px-4 py-2.5 text-sm text-ink hover:bg-brand/5 transition-colors"
              @click="menuOpen = false"
            >
              プロフィールを編集
            </NuxtLink>
            <div class="border-t border-surface-border my-1.5"></div>
            <button
              class="block w-full text-left px-4 py-2.5 text-sm text-ink-mute hover:text-warn hover:bg-brand/5 transition-colors"
              @click="signOut"
            >
              ログアウト
            </button>
          </div>
        </nav>
        <nav v-else class="flex items-center gap-2">
          <NuxtLink to="/login/" class="text-sm font-semibold px-4 py-2 rounded border border-brand text-brand hover:bg-brand/10 transition-colors">
            ログイン
          </NuxtLink>
          <NuxtLink to="/signup/" class="text-sm font-bold px-4 py-2 rounded bg-brand text-white hover:bg-brand-hover transition-colors">
            会員登録
          </NuxtLink>
        </nav>
      </div>
    </header>
    <main class="max-w-3xl mx-auto px-4 py-8" :class="showFloatingCta ? 'pb-28 md:pb-8' : ''">
      <slot />
    </main>

    <AppToast />
    <footer class="border-t border-surface-border mt-12">
      <div class="max-w-3xl mx-auto px-4 py-8">
        <!-- メディア カテゴリ -->
        <div class="mb-5">
          <p class="text-[11px] font-bold text-ink-mute tracking-wide mb-2.5">メディア</p>
          <div class="flex flex-wrap gap-x-4 gap-y-2 text-xs text-ink-soft">
            <NuxtLink to="/media/" class="hover:text-ink transition-colors">記事一覧</NuxtLink>
            <NuxtLink
              v-for="c in mediaCategories"
              :key="c.slug"
              :to="`/media/category/${c.slug}/`"
              class="hover:text-ink transition-colors"
            >{{ c.name }}</NuxtLink>
          </div>
        </div>
        <!-- 法務 -->
        <div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-mute pt-4 border-t border-surface-border">
          <span>© 2026 u-no.me</span>
          <NuxtLink to="/terms/" class="hover:text-ink-soft transition-colors">利用規約</NuxtLink>
          <NuxtLink to="/privacy/" class="hover:text-ink-soft transition-colors">プライバシーポリシー</NuxtLink>
        </div>
      </div>
    </footer>

    <!-- スマホ用フローティングCTA（未ログイン・認証系ページ以外） -->
    <div
      v-if="showFloatingCta"
      class="md:hidden fixed bottom-0 inset-x-0 z-40 px-4 pt-3 border-t border-surface-border bg-surface-deep/95 backdrop-blur"
      style="padding-bottom: calc(env(safe-area-inset-bottom) + 12px);"
    >
      <NuxtLink
        to="/signup/"
        class="block w-full text-center bg-brand text-white font-bold text-sm py-3.5 rounded-lg shadow-lg hover:bg-brand-hover transition-colors"
      >
        無料でユーザー登録 →
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getAuth, signOut as firebaseSignOut } from 'firebase/auth'

const user = useCurrentUser()
const userSlug = ref('')
const menuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const route = useRoute()
// 認証系ページ（ログイン/登録/オンボーディング）ではCTAを出さない
const isAuthPage = computed(() => /^\/(login|signup|onboarding)/.test(route.path))
const showFloatingCta = computed(() => !user.value && !isAuthPage.value)

const mediaCategories = useMediaCategories()

watch(user, async (u) => {
  if (!u) return
  const { getProfileByUid } = useUserProfile()
  const profile = await getProfileByUid(u.uid)
  userSlug.value = profile?.slug ?? ''
}, { immediate: true })

// メニュー外クリックで閉じる
function onClickOutside(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) menuOpen.value = false
}
onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))

async function signOut() {
  menuOpen.value = false
  if (!confirm('ログアウトしますか？')) return
  const auth = getAuth()
  await firebaseSignOut(auth)
  navigateTo('/')
}
</script>
