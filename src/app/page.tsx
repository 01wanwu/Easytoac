import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Key,
  Shield,
  BarChart3,
  Zap,
  Users,
  Clock,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const features = [
    {
      icon: Key,
      title: '激活码生成',
      description: '支持批量生成激活码，可自定义有效期和套餐类型，灵活满足各种业务需求。',
      color: 'bg-black'
    },
    {
      icon: Shield,
      title: '安全可靠',
      description: '采用JWT认证和bcrypt加密，支持IP白名单，确保系统安全性和数据保护。',
      color: 'bg-gray-900'
    },
    {
      icon: BarChart3,
      title: '数据统计',
      description: '实时统计激活码使用情况，可视化展示已用、过期和可用数量，一目了然。',
      color: 'bg-black'
    },
    {
      icon: Zap,
      title: '一机一码',
      description: '支持机器绑定，一机一码机制，有效防止激活码滥用和非法传播。',
      color: 'bg-gray-900'
    },
    {
      icon: Clock,
      title: '灵活期限',
      description: '支持周卡、月卡、季卡、年卡等多种套餐类型，也可自定义有效期天数。',
      color: 'bg-black'
    },
    {
      icon: Users,
      title: '简单易用',
      description: '简洁直观的管理界面，支持导出数据、批量管理，让激活码管理变得轻松高效。',
      color: 'bg-gray-900'
    }
  ]

  const benefits = [
    '快速部署，开箱即用',
    'SQLite数据库，轻量高效',
    '响应式设计，完美适配移动端',
    '现代化UI，基于shadcn/ui',
    '完整的RESTful API接口',
    '详细的操作日志记录'
  ]

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-32 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <div className="absolute inset-0 pointer-events-none bg-grid-slate-900/[0.04] bg-[bottom_1px_center]" />
        <div className="container mx-auto max-w-5xl">
          <div className="text-center space-y-8">
            <Badge variant="secondary" className="px-4 py-1.5 text-sm">
              v1.0.0 - 全新发布
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900">
              激活码管理系统
              <span className="block text-3xl md:text-5xl mt-4 text-gray-600">
                Easytoac
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              专业、安全、高效的激活码管理解决方案。
              <br />
              轻松管理您的软件授权和用户激活。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link href="/admin/login">
                  进入管理后台
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8 py-6">
                <a href="https://github.com/01wanwu/Easytoac" target="_blank" rel="noopener noreferrer">
                  查看源码
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>

            <div className="flex justify-center gap-8 pt-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>免费开源</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>易于部署</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>现代化技术栈</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              强大的功能特性
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              为您提供全方位的激活码管理解决方案，满足各种业务场景需求
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="border-2 hover:border-gray-900 transition-colors duration-300">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                为什么选择 Easytoac？
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                我们致力于提供最简单、最专业的激活码管理解决方案，
                让您专注于核心业务，而不是授权管理。
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-lg text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Card className="border-2 border-gray-200 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">技术栈</CardTitle>
                <CardDescription>
                  采用现代化技术栈构建，确保高性能和良好的开发体验
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Next.js 14</span>
                    <Badge variant="secondary">React框架</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-black h-2 rounded-full" style={{ width: '95%' }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">shadcn/ui</span>
                    <Badge variant="secondary">UI组件库</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-black h-2 rounded-full" style={{ width: '90%' }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Prisma</span>
                    <Badge variant="secondary">ORM</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-black h-2 rounded-full" style={{ width: '88%' }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">SQLite</span>
                    <Badge variant="secondary">数据库</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-black h-2 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">TypeScript</span>
                    <Badge variant="secondary">类型安全</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-black h-2 rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-4">
            <span className="text-2xl font-bold text-white">Easytoac</span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} Easytoac. Built with Next.js 14 & shadcn/ui
          </p>
          <p className="text-xs mt-2 text-gray-500">
            激活码管理系统 v1.0.0
          </p>
        </div>
      </footer>
    </main>
  )
}
