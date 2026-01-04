import { NextResponse } from 'next/server'
import { getConfigWithDefault } from '@/lib/config-service'

// 获取公开的系统配置（不需要认证）
export async function GET() {
  try {
    // 获取系统名称（带默认值）
    const systemName = await getConfigWithDefault('systemName')

    return NextResponse.json({
      success: true,
      systemName
    })

  } catch (error) {
    console.error('获取系统配置失败:', error)

    // 返回默认值
    return NextResponse.json({
      success: true,
      systemName: '激活码管理系统'
    })
  }
}
