# 一键启动脚本（Windows PowerShell）
# 说明：请确保已安装 Node.js、npm、JDK、Maven、MySQL，并已配置好数据库。

# 启动后端
Write-Host "启动后端服务..."
cd backend
Start-Process powershell -ArgumentList 'mvn spring-boot:run' -NoNewWindow
Start-Sleep -Seconds 5 # 等待后端部分启动
cd ..

# 启动前端
Write-Host "启动前端服务..."
cd frontend
npm install
npm run dev
