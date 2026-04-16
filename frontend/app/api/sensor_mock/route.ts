import { NextResponse } from 'next/server';

export async function GET() {
  // 模拟返回随机的温湿度数据，让大盘动起来
  const mockData = {
    code: 200,
    data: {
      temperature: 22 + Math.random() * 5, // 22-27度随机
      humidity: 60 + Math.random() * 10,    // 60-70%随机
      timestamp: new Date().toISOString()
    }
  };

  return NextResponse.json(mockData);
}