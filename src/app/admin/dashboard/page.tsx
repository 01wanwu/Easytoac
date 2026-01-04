'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Loader2,
  LogOut,
  Copy,
  FileText,
  BarChart3,
  Key,
  Settings,
  Database,
  Trash2,
  Download,
  AlertCircle,
  Package,
  TrendingUp,
  Users,
  Clock,
} from 'lucide-react'

// 定义激活码接口
interface ActivationCode {
  id: number
  code: string
  isUsed: boolean
  usedAt: string | null
  usedBy: string | null
  createdAt: string
  expiresAt: string | null
  validDays: number | null
  cardType: string | null
}

// 定义统计数据接口
interface Stats {
  total: number
  used: number
  expired: number
  active: number
}

// 定义套餐类型
interface CardType {
  name: string
  days: number
  description: string
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('stats')
  const [amount, setAmount] = useState(1)
  const [expiryDays, setExpiryDays] = useState(30)
  const [selectedCardType, setSelectedCardType] = useState<string>('')
  const [customDays, setCustomDays] = useState(30)
  const [loading, setLoading] = useState(false)
  const [generatedCodes, setGeneratedCodes] = useState<ActivationCode[]>([])
  const [allCodes, setAllCodes] = useState<ActivationCode[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, used: 0, expired: 0, active: 0 })
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'unused' | 'used' | 'expired'>('all')
  const [cardTypeFilter, setCardTypeFilter] = useState<'all' | string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [systemConfigs, setSystemConfigs] = useState<any[]>([])
  const [systemName, setSystemName] = useState('激活码管理后台')
  const router = useRouter()

  // 预设套餐类型
  const cardTypes: CardType[] = [
    { name: '周卡', days: 7, description: '7天有效期' },
    { name: '月卡', days: 30, description: '30天有效期' },
    { name: '季卡', days: 90, description: '90天有效期' },
    { name: '半年卡', days: 180, description: '180天有效期' },
    { name: '年卡', days: 365, description: '365天有效期' },
    { name: '自定义', days: 0, description: '自定义天数' }
  ]

  // 计算实际过期时间的辅助函数
  const getActualExpiresAt = (code: ActivationCode): Date | null => {
    if (code.usedAt && code.validDays) {
      return new Date(new Date(code.usedAt).getTime() + code.validDays * 24 * 60 * 60 * 1000)
    }
    return code.expiresAt ? new Date(code.expiresAt) : null
  }

  // 处理套餐类型选择
  const handleCardTypeChange = (cardType: string) => {
    setSelectedCardType(cardType)
    const selectedCard = cardTypes.find(card => card.name === cardType)
    if (selectedCard && selectedCard.days > 0) {
      setExpiryDays(selectedCard.days)
    }
  }

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/codes/stats')
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }

  // 获取系统配置
  const fetchSystemConfigs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/system-config')
      const data = await response.json()
      if (data.success) {
        setSystemConfigs(data.configs)
      } else {
        setMessage(data.message || '获取系统配置失败')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('网络错误，请重试')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  // 获取所有激活码
  const fetchAllCodes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/codes/list')
      const data = await response.json()
      if (data.success) {
        setAllCodes(data.codes)
      } else {
        setMessage(data.message || '获取激活码列表失败')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('网络错误，请重试')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  // 删除激活码
  const handleDeleteCode = async (id: number) => {
    if (!confirm('确定要删除这个激活码吗？')) return

    try {
      const response = await fetch(`/api/admin/codes/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      const data = await response.json()
      if (data.success) {
        setMessage('激活码删除成功')
        setMessageType('success')
        fetchAllCodes()
        fetchStats()
      } else {
        setMessage(data.message || '删除失败')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('网络错误，请重试')
      setMessageType('error')
    }
  }

  // 清理过期激活码
  const handleCleanupExpired = async () => {
    if (!confirm('确定要清理所有过期激活码的绑定关系吗？这将允许之前绑定过期激活码的机器使用新激活码。')) return

    try {
      setLoading(true)
      const response = await fetch('/api/admin/codes/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      if (data.success) {
        setMessage(data.message)
        setMessageType('success')
        fetchAllCodes()
        fetchStats()
      } else {
        setMessage(data.message || '清理失败')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('网络错误，请重试')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  // 获取系统名称（页面加载时执行一次）
  useEffect(() => {
    fetch('/api/public/config')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.systemName) {
          setSystemName(data.systemName + '管理后台')
        }
      })
      .catch(err => {
        console.error('获取系统名称失败:', err)
      })
  }, [])

  useEffect(() => {
    fetchStats()
    if (activeTab === 'list') {
      fetchAllCodes()
    }
    if (activeTab === 'systemConfig') {
      fetchSystemConfigs()
    }
  }, [activeTab])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage('请填写所有密码字段')
      setMessageType('error')
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage('新密码与确认密码不匹配')
      setMessageType('error')
      return
    }

    if (newPassword.length < 6) {
      setMessage('新密码长度不能少于6位')
      setMessageType('error')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(data.message)
        setMessageType('success')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => {
          handleLogout()
        }, 3000)
      } else {
        setMessage(data.message || '密码修改失败')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('网络错误，请重试')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  // 处理系统配置更新
  const handleUpdateSystemConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/system-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ configs: systemConfigs }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(data.message)
        setMessageType('success')
      } else {
        setMessage(data.message || '系统配置更新失败')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('网络错误，请重试')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  // 更新配置项值
  const updateConfigValue = (key: string, value: any) => {
    setSystemConfigs(prev =>
      prev.map(config =>
        config.key === key ? { ...config, value } : config
      )
    )
  }

  const handleGenerateCodes = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    try {
      setLoading(true)
      const finalExpiryDays = selectedCardType === '自定义' ? customDays : expiryDays
      const finalCardType = selectedCardType || null

      const response = await fetch('/api/admin/codes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          expiryDays: finalExpiryDays,
          cardType: finalCardType
        }),
      })

      const data = await response.json()
      if (data.success) {
        setGeneratedCodes(data.codes)
        setMessage(data.message)
        setMessageType('success')
        fetchStats()
      } else {
        setMessage(data.message || '生成失败')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('网络错误，请重试')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setMessage('已复制到剪贴板')
    setMessageType('success')
  }

  const exportCodes = (codes: ActivationCode[]) => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "激活码,套餐类型,状态,创建时间,过期时间,使用时间,使用者\n"
      + codes.map(code => {
        let status = '未激活'
        let expiresDisplay = '激活后生效'

        const actualExpiresAt = getActualExpiresAt(code)
        const isExpired = actualExpiresAt ? actualExpiresAt < new Date() : false

        if (isExpired) {
          status = '已过期'
          expiresDisplay = actualExpiresAt ? actualExpiresAt.toLocaleString() : '无限期'
        } else if (code.isUsed) {
          status = '已使用'
          expiresDisplay = actualExpiresAt ? actualExpiresAt.toLocaleString() : '无限期'
        } else if (!code.validDays) {
          expiresDisplay = '无限期'
        }

        const cardTypeDisplay = getCardTypeDisplay(code)

        return `${code.code},${cardTypeDisplay},${status},${new Date(code.createdAt).toLocaleString()},${expiresDisplay},${code.usedAt ? new Date(code.usedAt).toLocaleString() : ''},${code.usedBy || ''}`
      }).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `activation_codes_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 筛选激活码
  const filteredCodes = allCodes.filter(code => {
    const matchesSearch = code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (code.usedBy && code.usedBy.toLowerCase().includes(searchTerm.toLowerCase()))

    const now = new Date()
    const actualExpiresAt = getActualExpiresAt(code)
    const isExpired = actualExpiresAt ? actualExpiresAt < now : false

    let matchesStatus = true
    switch (statusFilter) {
      case 'unused':
        matchesStatus = !code.isUsed && !isExpired
        break
      case 'used':
        matchesStatus = code.isUsed && !isExpired
        break
      case 'expired':
        matchesStatus = isExpired
        break
    }

    let matchesCardType = true
    if (cardTypeFilter !== 'all') {
      if (cardTypeFilter === 'none') {
        matchesCardType = !code.cardType
      } else {
        matchesCardType = code.cardType === cardTypeFilter
      }
    }

    return matchesSearch && matchesStatus && matchesCardType
  })

  // 分页逻辑
  const totalPages = Math.ceil(filteredCodes.length / itemsPerPage)
  const paginatedCodes = filteredCodes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getStatusBadge = (code: ActivationCode) => {
    const now = new Date()
    const actualExpiresAt = getActualExpiresAt(code)
    const isExpired = actualExpiresAt ? actualExpiresAt < now : false

    if (isExpired) {
      return <Badge variant="destructive">已过期</Badge>
    } else if (code.isUsed) {
      return <Badge variant="default">已使用</Badge>
    } else {
      return <Badge variant="secondary">未激活</Badge>
    }
  }

  // 获取套餐类型显示
  const getCardTypeDisplay = (code: ActivationCode) => {
    if (code.cardType) {
      return code.cardType
    } else if (code.validDays) {
      return `${code.validDays}天`
    } else {
      return '无限期'
    }
  }

  // 获取可用的套餐类型列表
  const getAvailableCardTypes = () => {
    const types = new Set<string>()
    allCodes.forEach(code => {
      if (code.cardType) {
        types.add(code.cardType)
      }
    })
    return Array.from(types).sort()
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{systemName}</h1>
            <p className="text-gray-500 mt-1">管理和监控您的激活码</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 transition-colors rounded-lg hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" />
            <span>退出</span>
          </button>
        </div>

        {/* 消息提示 */}
        {message && (
          <Alert variant={messageType === 'success' ? 'default' : 'destructive'} className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* 主标签页 */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">数据统计</span>
            </TabsTrigger>
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">生成激活码</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">激活码管理</span>
            </TabsTrigger>
            <TabsTrigger value="changePassword" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">修改密码</span>
            </TabsTrigger>
            <TabsTrigger value="systemConfig" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">系统配置</span>
            </TabsTrigger>
          </TabsList>

          {/* 数据统计标签页 */}
          <TabsContent value="stats" className="space-y-6">
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总激活码数</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground mt-1">系统中的所有激活码</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">已使用</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{stats.used}</div>
                  <p className="text-xs text-muted-foreground mt-1">已被激活的激活码</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">已过期</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{stats.expired}</div>
                  <p className="text-xs text-muted-foreground mt-1">超过有效期的激活码</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">可用激活码</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{stats.active}</div>
                  <p className="text-xs text-muted-foreground mt-1">未激活且有效</p>
                </CardContent>
              </Card>
            </div>

            {/* 使用率图表 */}
            <Card>
              <CardHeader>
                <CardTitle>使用率统计</CardTitle>
                <CardDescription>激活码使用情况的可视化统计</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">已使用</span>
                    <span className="text-muted-foreground">{stats.total > 0 ? Math.round((stats.used / stats.total) * 100) : 0}%</span>
                  </div>
                  <Progress value={stats.total > 0 ? (stats.used / stats.total) * 100 : 0} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">已过期</span>
                    <span className="text-muted-foreground">{stats.total > 0 ? Math.round((stats.expired / stats.total) * 100) : 0}%</span>
                  </div>
                  <Progress value={stats.total > 0 ? (stats.expired / stats.total) * 100 : 0} className="h-2 bg-red-100">
                    <div className="h-full bg-red-500 transition-all" />
                  </Progress>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">可用</span>
                    <span className="text-muted-foreground">{stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%</span>
                  </div>
                  <Progress value={stats.total > 0 ? (stats.active / stats.total) * 100 : 0} className="h-2 bg-blue-100">
                    <div className="h-full bg-blue-500 transition-all" />
                  </Progress>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 生成激活码标签页 */}
          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>生成激活码</CardTitle>
                <CardDescription>批量生成新的激活码</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerateCodes} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="amount">生成数量</Label>
                      <Input
                        type="number"
                        id="amount"
                        min="1"
                        max="100"
                        value={amount}
                        onChange={(e) => setAmount(parseInt(e.target.value))}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardType">套餐类型</Label>
                      <Select
                        value={selectedCardType}
                        onValueChange={handleCardTypeChange}
                        disabled={loading}
                      >
                        <SelectTrigger id="cardType">
                          <SelectValue placeholder="请选择套餐类型" />
                        </SelectTrigger>
                        <SelectContent>
                          {cardTypes.map((cardType) => (
                            <SelectItem key={cardType.name} value={cardType.name}>
                              {cardType.name} ({cardType.description})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expiryDays">有效期（天）</Label>
                      <Input
                        type="number"
                        id="expiryDays"
                        min="1"
                        value={selectedCardType === '自定义' ? customDays : expiryDays}
                        onChange={(e) => {
                          const value = parseInt(e.target.value)
                          if (selectedCardType === '自定义') {
                            setCustomDays(value)
                          } else {
                            setExpiryDays(value)
                          }
                        }}
                        disabled={selectedCardType !== '自定义' && selectedCardType !== '' || loading}
                      />
                      {selectedCardType && selectedCardType !== '自定义' && (
                        <p className="text-sm text-muted-foreground">
                          已选择{selectedCardType}，有效期自动设置为 {expiryDays} 天
                        </p>
                      )}
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            生成中...
                          </>
                        ) : (
                          <>
                            <Package className="mr-2 h-4 w-4" />
                            生成{selectedCardType ? selectedCardType : ''}激活码
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* 生成的激活码列表 */}
            {generatedCodes.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>本次生成的激活码</CardTitle>
                      <CardDescription>共生成 {generatedCodes.length} 个激活码</CardDescription>
                    </div>
                    <Button onClick={() => exportCodes(generatedCodes)}>
                      <Download className="mr-2 h-4 w-4" />
                      导出CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>激活码</TableHead>
                          <TableHead>套餐类型</TableHead>
                          <TableHead>创建时间</TableHead>
                          <TableHead>有效期</TableHead>
                          <TableHead>操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {generatedCodes.map((code) => (
                          <TableRow key={code.id}>
                            <TableCell className="font-mono text-sm">{code.code}</TableCell>
                            <TableCell>{getCardTypeDisplay(code)}</TableCell>
                            <TableCell>{new Date(code.createdAt).toLocaleString()}</TableCell>
                            <TableCell>{code.validDays ? `${code.validDays}天（激活后生效）` : '无限期'}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(code.code)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 激活码管理标签页 */}
          <TabsContent value="list" className="space-y-6">
            {/* 搜索和筛选 */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">搜索</Label>
                    <Input
                      id="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="输入激活码或机器ID"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">状态筛选</Label>
                    <Select
                      value={statusFilter}
                      onValueChange={(value: any) => setStatusFilter(value)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部状态</SelectItem>
                        <SelectItem value="unused">未激活</SelectItem>
                        <SelectItem value="used">已使用</SelectItem>
                        <SelectItem value="expired">已过期</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardTypeFilter">套餐类型</Label>
                    <Select
                      value={cardTypeFilter}
                      onValueChange={setCardTypeFilter}
                    >
                      <SelectTrigger id="cardTypeFilter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部套餐</SelectItem>
                        {getAvailableCardTypes().map((cardType) => (
                          <SelectItem key={cardType} value={cardType}>
                            {cardType}
                          </SelectItem>
                        ))}
                        <SelectItem value="none">无套餐类型</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      onClick={() => exportCodes(filteredCodes)}
                      className="w-full"
                      variant="secondary"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      导出筛选结果
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 激活码列表 */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>激活码列表</CardTitle>
                    <CardDescription>{filteredCodes.length} 条记录</CardDescription>
                  </div>
                  <Button
                    onClick={handleCleanupExpired}
                    disabled={loading}
                    variant="secondary"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    清理过期绑定
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground mt-2">加载中...</p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>激活码</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>套餐类型</TableHead>
                            <TableHead>创建时间</TableHead>
                            <TableHead>过期时间</TableHead>
                            <TableHead>使用时间</TableHead>
                            <TableHead>使用者</TableHead>
                            <TableHead>操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedCodes.map((code) => (
                            <TableRow key={code.id}>
                              <TableCell className="font-mono text-sm">{code.code}</TableCell>
                              <TableCell>{getStatusBadge(code)}</TableCell>
                              <TableCell>{getCardTypeDisplay(code)}</TableCell>
                              <TableCell>{new Date(code.createdAt).toLocaleString()}</TableCell>
                              <TableCell>
                                {(() => {
                                  if (!code.isUsed) {
                                    return code.validDays ? '激活后生效' : '无限期'
                                  }
                                  const actualExpiresAt = getActualExpiresAt(code)
                                  return actualExpiresAt ? actualExpiresAt.toLocaleString() : '无限期'
                                })()}
                              </TableCell>
                              <TableCell>{code.usedAt ? new Date(code.usedAt).toLocaleString() : '-'}</TableCell>
                              <TableCell>{code.usedBy || '-'}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(code.code)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteCode(code.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* 分页 */}
                    {totalPages > 1 && (
                      <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          显示第 {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredCodes.length)} 条，共 {filteredCodes.length} 条记录
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            上一页
                          </Button>
                          <div className="flex gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <Button
                                key={page}
                                variant={currentPage === page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="w-9"
                              >
                                {page}
                              </Button>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            下一页
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 修改密码标签页 */}
          <TabsContent value="changePassword">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>修改管理员密码</CardTitle>
                <CardDescription>更新您的管理员账户密码</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">当前密码</Label>
                    <Input
                      type="password"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="请输入当前密码"
                      disabled={loading}
                      required
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">新密码</Label>
                    <Input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="请输入新密码（至少6位）"
                      disabled={loading}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">确认新密码</Label>
                    <Input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="请再次输入新密码"
                      disabled={loading}
                      required
                      minLength={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        修改中...
                      </>
                    ) : (
                      <>
                        <Key className="mr-2 h-4 w-4" />
                        修改密码
                      </>
                    )}
                  </Button>
                </form>

                <Alert className="mt-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>注意事项：</strong>
                    <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                      <li>新密码长度不能少于6位</li>
                      <li>密码修改成功后将自动退出，需要使用新密码重新登录</li>
                      <li>请确保妥善保管新密码</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 系统配置标签页 */}
          <TabsContent value="systemConfig">
            <Card>
              <CardHeader>
                <CardTitle>系统配置管理</CardTitle>
                <CardDescription>管理系统的重要配置参数</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground mt-2">加载中...</p>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateSystemConfig} className="space-y-6">
                    {systemConfigs.map((config) => (
                      <div key={config.key} className="space-y-2 pb-4 border-b last:border-b-0">
                        <div className="flex justify-between items-start">
                          <Label className="text-base font-medium">{config.key}</Label>
                          <span className="text-xs text-muted-foreground">{config.description}</span>
                        </div>

                        {config.key === 'allowedIPs' ? (
                          <Textarea
                            value={Array.isArray(config.value) ? config.value.join('\n') : config.value}
                            onChange={(e) => {
                              const ips = e.target.value.split('\n').filter(ip => ip.trim())
                              updateConfigValue(config.key, ips)
                            }}
                            rows={4}
                            placeholder="127.0.0.1&#10;::1"
                            className="font-mono text-sm"
                          />
                        ) : config.key === 'bcryptRounds' ? (
                          <div className="space-y-2">
                            <Input
                              type="number"
                              min="4"
                              max="15"
                              value={config.value}
                              onChange={(e) => updateConfigValue(config.key, parseInt(e.target.value))}
                            />
                            <p className="text-xs text-muted-foreground">
                              推荐值：10-12（值越大越安全但计算越慢）
                            </p>
                          </div>
                        ) : config.key === 'jwtExpiresIn' ? (
                          <Select
                            value={config.value}
                            onValueChange={(value) => updateConfigValue(config.key, value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1h">1小时</SelectItem>
                              <SelectItem value="6h">6小时</SelectItem>
                              <SelectItem value="12h">12小时</SelectItem>
                              <SelectItem value="24h">24小时</SelectItem>
                              <SelectItem value="7d">7天</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type="text"
                            value={config.value}
                            onChange={(e) => updateConfigValue(config.key, e.target.value)}
                            placeholder={`请输入${config.description || config.key}`}
                          />
                        )}
                      </div>
                    ))}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          保存中...
                        </>
                      ) : (
                        <>
                          <Settings className="mr-2 h-4 w-4" />
                          保存配置
                        </>
                      )}
                    </Button>
                  </form>
                )}

                <div className="mt-8 space-y-4">
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      <strong>配置说明：</strong>
                      <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                        <li><strong>allowedIPs</strong>：允许访问管理后台的IP地址白名单</li>
                        <li><strong>jwtSecret</strong>：JWT令牌加密密钥（修改后所有用户需重新登录）</li>
                        <li><strong>jwtExpiresIn</strong>：JWT令牌有效期</li>
                        <li><strong>bcryptRounds</strong>：密码加密强度（4-15，推荐10-12）</li>
                        <li><strong>systemName</strong>：系统显示名称</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>注意事项：</strong>
                      <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                        <li>修改JWT密钥后，所有已登录用户需要重新登录</li>
                        <li>修改IP白名单时请确保包含当前访问IP，否则可能被锁定</li>
                        <li>配置修改立即生效，请谨慎操作</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
