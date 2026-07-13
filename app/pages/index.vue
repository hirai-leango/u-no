<template>
  <div>
    <!-- ヒーロー -->
    <section class="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <img
        src="/yunomi-chabashira-transparent.gif"
        alt="ユーノーミー"
        class="w-44 h-44 md:w-56 md:h-56 object-contain mb-6"
        style="image-rendering: pixelated;"
      />
      <h1 class="text-3xl md:text-5xl mb-4 font-black text-ink leading-tight whitespace-nowrap">
        流石に０レビューの人は<br>ちょっと警戒しちゃうよね
      </h1>
      <p class="text-ink-soft text-base mb-10 max-w-md leading-relaxed">
        ユーノーミーは知人があなたを紹介する、<br>ビジネスプロフィールサービスです。
      </p>

      <div v-if="!user" class="flex flex-col gap-3 w-64">
        <button
          v-for="provider in providers"
          :key="provider.id"
          class="flex items-center justify-center gap-3 px-5 py-3 rounded font-semibold text-sm transition-opacity hover:opacity-80 active:scale-95"
          :class="provider.class"
          @click="login(provider.id)"
        >
          <Icon :name="provider.icon" class="text-lg" />
          {{ provider.label }}
        </button>
      </div>

      <div v-else class="flex flex-col items-center gap-4">
        <p class="text-ink-mute text-sm">ログイン中: {{ user.displayName }}</p>
        <NuxtLink
          v-if="userSlug"
          :to="`/u/${userSlug}/`"
          class="px-6 py-3 bg-brand text-white rounded font-bold text-sm hover:bg-brand-hover transition-colors"
        >
          マイページへ →
        </NuxtLink>
        <NuxtLink
          v-else
          to="/onboarding/"
          class="px-6 py-3 bg-brand text-white rounded font-bold text-sm hover:bg-brand-hover transition-colors"
        >
          プロフィールを設定する →
        </NuxtLink>
      </div>
    </section>

    <!-- 以下、未ログインの訪問者向けランディング -->
    <div v-if="!user" class="-mx-4">

      <!-- u-no.me とは -->
      <section class="px-6 py-20">
        <p class="text-[11px] tracking-[.24em] text-trust font-bold text-center mb-3">ユーノーミーとは</p>
        <h2 class="font-black text-2xl md:text-4xl text-center mb-5 leading-snug text-ink">
          あなたが信頼できることは、<br>周りの人が教えてくれる。<br>You know me !
        </h2>

        <div class="flex flex-col gap-px bg-line border border-line max-w-xl mx-auto">
          <div v-for="f in features" :key="f.title" class="bg-white p-6 flex items-center gap-4">
            <img :src="f.icon" class="w-14 h-14 object-contain flex-none" style="image-rendering: pixelated;" alt="" />
            <div>
              <h3 class="font-bold text-[15.5px] mb-1.5 text-ink">{{ f.title }}</h3>
              <p class="text-[13px] text-ink-soft leading-relaxed">{{ f.body }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 登録する理由 -->
      <section class="bg-brand text-white">
        <div class="px-6 py-20 max-w-3xl mx-auto">
          <p class="text-[11px] tracking-[.24em] uppercase text-trust font-bold text-center mb-3">登録する理由</p>
          <h2 class="font-black text-2xl md:text-4xl text-center mb-5 leading-snug text-white">
            名刺に書ききれない信頼を、<br>周りの人が補ってくれる。
          </h2>
          <p class="text-white/75 text-sm text-center max-w-md mx-auto mb-10">
            だからこそ、周りの人の一言が効きます。
          </p>

          <div class="grid md:grid-cols-2 gap-5">
            <div v-for="r in reasons" :key="r.no" class="flex gap-4 p-5 bg-white/[.06] border border-white/15">
              <span class="font-dot text-xl text-trust flex-none">{{ r.no }}</span>
              <div>
                <h4 class="text-sm text-white mb-1 font-bold">{{ r.title }}</h4>
                <p class="text-[12.5px] text-white/80 leading-relaxed">{{ r.body }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 使い方 -->
      <section class="px-6 py-20 max-w-3xl mx-auto">
        <p class="text-[11px] tracking-[.24em] uppercase text-trust font-bold text-center mb-3">使い方</p>
        <h2 class="font-black text-2xl md:text-4xl text-center mb-5 text-ink">やることは、3つだけ。</h2>
        <p class="text-ink-soft text-sm text-center max-w-md mx-auto mb-10">難しい設定は、ひとつもありません。</p>

        <div class="max-w-xl mx-auto flex flex-col">
          <div
            v-for="(s, i) in steps"
            :key="s.title"
            class="flex gap-5 py-6"
            :class="i > 0 ? 'border-t border-line' : ''"
          >
            <div class="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center font-black text-sm flex-none">
              {{ i + 1 }}
            </div>
            <div>
              <h4 class="text-[15px] font-bold mb-1.5 text-ink">{{ s.title }}</h4>
              <p class="text-[13px] text-ink-soft leading-relaxed">{{ s.body }}</p>
            </div>
          </div>
        </div>

        <div class="text-center mt-12">
          <button
            class="bg-white text-gray-800 flex items-center justify-center gap-3 px-5 py-3 rounded font-semibold text-sm transition-opacity hover:opacity-80 active:scale-95 mx-auto"
            @click="login('google')"
          >
            <Icon name="logos:google-icon" class="text-lg" />
            Googleでログイン
          </button>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  getAuth,
} from 'firebase/auth'

const siteTitle = 'ユーノーミー（u-no.me）| 知人があなたを紹介するビジネスプロフィールサービス'
const siteDescription = 'ユーノーミーは、知人や取引先があなたを紹介してくれる第三者レビュー型のビジネスプロフィールサービス。自分で盛るのではなく、周りの人の証言で信頼を可視化。URLひとつで、名刺やSNSから自己紹介できます。'

useSeoMeta({
  title: siteTitle,
  ogTitle: siteTitle,
  description: siteDescription,
  ogDescription: siteDescription,
  ogImage: 'https://u-no.me/ogp-top.png',
  twitterImage: 'https://u-no.me/ogp-top.png',
})

const user = useCurrentUser()
const userSlug = ref('')

const providers = [
  { id: 'google', label: 'Googleでログイン', icon: 'logos:google-icon', class: 'bg-white text-gray-800' },
  // TODO: いつか実装する（Meta/GitHub側の設定・審査が必要）
  // { id: 'github', label: 'GitHubでログイン', icon: 'logos:github-icon', class: 'bg-gray-900 text-white border border-surface-border' },
  // { id: 'facebook', label: 'Facebookでログイン', icon: 'logos:facebook', class: 'bg-[#1877f2] text-white' },
]

const features = [
  { icon: '/icon-cert.svg', title: '信頼を、証明する', body: '第三者の口コミが信頼になるのは、お店選びでみんな知っていますよね。同じことを、あなた自身に。' },
  { icon: '/icon-self.svg', title: '自分で言わなくていい', body: '「仕事ができます」と自分で言うのは、少し気恥ずかしい。代わりに周りの人が語ってくれます。' },
  { icon: '/icon-truth.svg', title: '嘘や荒らしは許されない', body: '実名で書かれたレビューには、第三者がGood/Badで応えられる。悪意ある評価は自然と沈みます。' },
]

const reasons = [
  { no: '01', title: 'URLひとつで共有できる', body: '名刺交換のあとに、わざわざ繋がり申請しなくていい。URLを渡すだけです。' },
  { no: '02', title: '自分の口で言わなくていい', body: '「仕事できます」と自分で言う気まずさから解放されます。' },
  { no: '03', title: '知っている人の一言が効く', body: '知らない人の星5より、知人の一言の方が信じられますよね。' },
  { no: '04', title: '登録は1分、履歴書は後回しでいい', body: '最初に面倒な入力を求められない。まず始められます。' },
]

const steps = [
  { title: 'プロフィールを作る', body: 'Googleでログインして、名前と一言を決めたら完成です。' },
  { title: '名刺やSNSに置く', body: '発行されたURLを名刺やSNSのプロフィール欄に貼るだけ。' },
  { title: '知人に一言をお願いする', body: '実名と関係性を選んで、一言を添えてもらうだけです。' },
]

watch(user, async (u) => {
  if (!u) return
  const { getProfileByUid } = useUserProfile()
  const profile = await getProfileByUid(u.uid)
  userSlug.value = profile?.slug ?? ''
  if (profile?.slug) navigateTo(`/u/${profile.slug}/`)
  else navigateTo('/onboarding/')
}, { immediate: true })

async function login(providerId: string) {
  const auth = getAuth()
  const providerMap: Record<string, any> = {
    google: new GoogleAuthProvider(),
    github: new GithubAuthProvider(),
    facebook: new FacebookAuthProvider(),
  }
  await signInWithPopup(auth, providerMap[providerId])
}
</script>
