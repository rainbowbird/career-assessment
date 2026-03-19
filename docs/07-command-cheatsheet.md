# 07 - Command Cheatsheet

> Complete command reference for debugging and maintenance

## Table of Contents
1. [curl Commands](#curl-commands)
2. [MySQL Commands](#mysql-commands)
3. [Docker Commands](#docker-commands)
4. [Nginx Commands](#nginx-commands)
5. [Git Commands](#git-commands)
6. [System Commands](#system-commands)

---

## curl Commands

### Health Checks

```bash
# Test backend health
curl -s http://localhost:3000/api/health | jq '.'

# Test through Nginx
curl -s http://localhost:8080/api/health | jq '.'

# With verbose output
curl -v http://localhost:8080/api/health

# With headers only
curl -I http://localhost:8080/api/health
```

### API Testing

```bash
# Create assessment (no auth required)
curl -X POST http://localhost:8080/api/assessments \
  -H "Content-Type: application/json" \
  -d '{
    "assessmentId": "12345",
    "userInfo": {
      "name": "测试用户",
      "major": "计算机科学",
      "class": "软件1班",
      "email": "test@test.com",
      "school": "测试大学",
      "phone": "13800138000",
      "education": "本科"
    },
    "answers": [0, 1, 2, 3, 4],
    "scores": {
      "totalScore": 85,
      "dimensionScores": [
        {"name": "沟通表达", "score": 90},
        {"name": "团队协作", "score": 85}
      ]
    },
    "timeElapsed": 120
  }' | jq '.'
```

### Authentication

```bash
# Login and save cookies
curl -X POST http://localhost:8080/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password": "Lonlink789"}' \
  -c cookies.txt \
  -v

# Check auth status
curl -s http://localhost:8080/api/admin/check \
  -b cookies.txt | jq '.'

# Logout
curl -X POST http://localhost:8080/api/admin/logout \
  -b cookies.txt -c cookies.txt
```

### Authenticated Requests

```bash
# Get all assessments
curl -s http://localhost:8080/api/assessments \
  -b cookies.txt | jq '.'

# Get statistics
curl -s http://localhost:8080/api/assessments/statistics \
  -b cookies.txt | jq '.'

# Get specific assessment
curl -s http://localhost:8080/api/assessments/12345 \
  -b cookies.txt | jq '.'

# Delete assessment
curl -X DELETE http://localhost:8080/api/assessments/12345 \
  -b cookies.txt

# Export Excel
curl -s http://localhost:8080/api/admin/export \
  -b cookies.txt \
  -o assessments.xlsx

# Export with filters
curl -s "http://localhost:8080/api/admin/export?major=计算机&minScore=80" \
  -b cookies.txt \
  -o filtered.xlsx
```

### Response Parsing

```bash
# Extract specific field
curl -s http://localhost:8080/api/assessments -b cookies.txt | \
  jq '.data.total'

# Get first assessment name
curl -s http://localhost:8080/api/assessments -b cookies.txt | \
  jq '.data.assessments[0].name'

# Filter assessments
curl -s http://localhost:8080/api/assessments -b cookies.txt | \
  jq '.data.assessments[] | {name, totalScore}'

# Pretty print with colors
curl -s http://localhost:8080/api/assessments -b cookies.txt | \
  python3 -m json.tool
```

### Timing and Performance

```bash
# Measure response time
curl -w "\nTime: %{time_total}s\n" \
  -s -o /dev/null \
  http://localhost:8080/api/health

# Detailed timing
curl -w "
Time Details:
  DNS Lookup:     %{time_namelookup}s
  TCP Connect:    %{time_connect}s
  TLS Handshake:  %{time_appconnect}s
  First Byte:     %{time_starttransfer}s
  Total:          %{time_total}s
" -s -o /dev/null http://localhost:8080/api/health
```

---

## MySQL Commands

### Container Access

```bash
# Interactive MySQL shell
docker-compose exec mysql mysql -u root -ppassword

# Execute single command
docker-compose exec mysql mysql -u root -ppassword \
  -e "SHOW DATABASES;"

# Execute with database context
docker-compose exec mysql mysql -u root -ppassword \
  -e "USE career_assessment; SELECT * FROM assessments;"

# Run SQL file
docker-compose exec -T mysql mysql -u root -ppassword \
  < database/init.sql
```

### Data Queries

```sql
-- Count records
SELECT COUNT(*) FROM assessments;

-- Recent assessments
SELECT assessment_id, name, total_score, created_at 
FROM assessments 
ORDER BY created_at DESC 
LIMIT 10;

-- Search by name
SELECT * FROM assessments WHERE name LIKE '%张%';

-- Filter by score
SELECT * FROM assessments 
WHERE total_score BETWEEN 80 AND 90 
ORDER BY total_score DESC;

-- Statistics by major
SELECT 
    major,
    COUNT(*) as count,
    AVG(total_score) as avg_score,
    MIN(total_score) as min_score,
    MAX(total_score) as max_score
FROM assessments
GROUP BY major;

-- Score distribution
SELECT 
    CASE 
        WHEN total_score >= 90 THEN '90-100'
        WHEN total_score >= 80 THEN '80-89'
        WHEN total_score >= 70 THEN '70-79'
        WHEN total_score >= 60 THEN '60-69'
        ELSE '0-59'
    END as range,
    COUNT(*) as count
FROM assessments
GROUP BY range;

-- Daily submissions
SELECT 
    DATE(created_at) as date,
    COUNT(*) as count
FROM assessments
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 30;

-- Check data quality
SELECT * FROM assessments 
WHERE name IS NULL OR email IS NULL OR total_score IS NULL;

-- JSON field queries
SELECT 
    assessment_id,
    JSON_EXTRACT(scores, '$.totalScore') as score
FROM assessments;
```

### Schema Operations

```sql
-- Show tables
SHOW TABLES;

-- Describe table
DESCRIBE assessments;

-- Show create statement
SHOW CREATE TABLE assessments;

-- Show indexes
SHOW INDEX FROM assessments;

-- Show columns
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'assessments';
```

### Backup and Restore

```bash
# Full backup
docker-compose exec mysql mysqldump -u root -ppassword \
  career_assessment > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup specific table
docker-compose exec mysql mysqldump -u root -ppassword \
  career_assessment assessments > assessments_backup.sql

# Compressed backup
docker-compose exec mysql mysqldump -u root -ppassword \
  career_assessment | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore from backup
docker-compose exec -T mysql mysql -u root -ppassword \
  career_assessment < backup.sql

# Restore compressed
gunzip < backup.sql.gz | docker-compose exec -T mysql \
  mysql -u root -ppassword career_assessment
```

---

## Docker Commands

### Container Management

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ destroys data)
docker-compose down -v

# Restart specific service
docker-compose restart backend

# Recreate container
docker-compose up -d --force-recreate backend

# Rebuild and start
docker-compose up -d --build

# Scale service
docker-compose up -d --scale backend=3
```

### Container Inspection

```bash
# List running containers
docker-compose ps

# List all containers (including stopped)
docker-compose ps -a

# Container details
docker-compose exec backend env
docker-compose top backend
docker-compose exec backend ps aux

# Resource usage
docker-compose stats
docker-compose stats --no-stream

# Container info
docker-compose exec backend cat /etc/os-release
docker-compose exec backend uname -a
```

### Log Management

```bash
# View all logs
docker-compose logs

# Follow logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Multiple services
docker-compose logs -f backend mysql

# Last N lines
docker-compose logs --tail=100 backend

# Since time
docker-compose logs --since=2026-03-19T10:00:00

# With timestamps
docker-compose logs -t backend

# Search logs
docker-compose logs backend | grep -i error
docker-compose logs backend | grep -E '(error|warn|fatal)'

# Save logs
docker-compose logs > all-logs.txt
docker-compose logs backend > backend-logs.txt
```

### Network Debugging

```bash
# List networks
docker network ls

# Inspect network
docker network inspect career-network

# Test connectivity
docker-compose exec backend ping mysql
docker-compose exec frontend ping backend

# DNS resolution
docker-compose exec backend nslookup mysql

# Port testing
docker-compose exec backend nc -zv mysql 3306
docker-compose exec backend nc -zv backend 3000

# List container IPs
docker network inspect career-network | \
  grep -A 3 "Containers"
```

### Volume Operations

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect career-assessment_mysql_data

# Volume usage
docker system df -v

# Clean up unused volumes
docker volume prune

# Backup volume
docker run --rm \
  -v career-assessment_mysql_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/volume-backup.tar.gz -C /data .

# Restore volume
docker run --rm \
  -v career-assessment_mysql_data:/data \
  -v $(pwd):/backup \
  alpine sh -c "cd /data && tar xzf /backup/volume-backup.tar.gz"
```

### System Maintenance

```bash
# Disk usage
docker system df
docker system df -v

# Clean up
docker system prune          # Remove stopped containers, unused networks
docker system prune -a       # Also remove unused images
docker volume prune          # Remove unused volumes
docker image prune           # Remove unused images

# Remove specific resources
docker rm $(docker ps -aq --filter "status=exited")
docker rmi $(docker images -q --filter "dangling=true")
```

---

## Nginx Commands

### Configuration

```bash
# Test configuration
docker-compose exec frontend nginx -t

# Reload configuration
docker-compose exec frontend nginx -s reload

# View configuration
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf

# Check syntax and reload
docker-compose exec frontend sh -c "nginx -t && nginx -s reload"
```

### Log Analysis

```bash
# Access logs
docker-compose exec frontend tail -f /var/log/nginx/access.log

# Error logs
docker-compose exec frontend tail -f /var/log/nginx/error.log

# Filter by status
docker-compose exec frontend cat /var/log/nginx/access.log | \
  grep ' 404 '

# Count by status
docker-compose exec frontend cat /var/log/nginx/access.log | \
  awk '{print $9}' | sort | uniq -c | sort -rn

# Slow requests (> 1s)
docker-compose exec frontend cat /var/log/nginx/access.log | \
  awk '$NF > 1 {print $0}'

# Top URLs
docker-compose exec frontend cat /var/log/nginx/access.log | \
  awk '{print $7}' | sort | uniq -c | sort -rn | head -20
```

### Testing

```bash
# Test specific URLs
curl -I http://localhost:8080/
curl -I http://localhost:8080/api/health
curl -I http://localhost:8080/js/api.js

# Verbose testing
curl -v http://localhost:8080/api/health

# Test with custom headers
curl -H "X-Debug: true" http://localhost:8080/api/health

# Test static files
curl -o /dev/null -w "%{http_code} %{size_download}\n" \
  http://localhost:8080/js/api.js
```

### Process Management

```bash
# Check Nginx status
docker-compose exec frontend ps aux | grep nginx

# Nginx version
docker-compose exec frontend nginx -v

# List modules
docker-compose exec frontend nginx -V
```

---

## Git Commands

### Repository Operations

```bash
# Initialize repository
git init

# Clone repository
git clone https://github.com/username/career-assessment.git

# Check status
git status

# View log
git log --oneline
git log --graph --oneline --all

# View specific commit
git show HEAD
git show <commit-hash>
```

### Basic Workflow

```bash
# Add files
git add .
git add filename.js
git add docs/*.md

# Commit
git commit -m "Description"
git commit -m "Title" -m "Detailed description"

# Amend last commit
git commit --amend -m "New message"

# Push
git push origin main
git push -u origin main

# Pull
git pull origin main
```

### Branching

```bash
# List branches
git branch
git branch -a

# Create branch
git checkout -b feature/new-feature

# Switch branch
git checkout main
git checkout feature/other-feature

# Merge branch
git checkout main
git merge feature/new-feature

# Delete branch
git branch -d feature/old-feature
git branch -D feature/unmerged-feature
```

### Debugging

```bash
# View changes
git diff
git diff filename.js
git diff --cached  # Staged changes

# View file history
git log -p filename.js
git log --oneline -- filename.js

# Blame
git blame filename.js

# Stash
git stash
git stash list
git stash pop
git stash apply

# Reset
git reset HEAD~1           # Undo last commit, keep changes
git reset --hard HEAD~1    # Undo last commit, discard changes
git checkout -- filename   # Discard file changes
```

---

## System Commands

### Port Management

```bash
# List listening ports
lsof -i -P | grep LISTEN
netstat -tlnp

# Check specific port
lsof -i :3000
lsof -i :8080

# Kill process by port
kill $(lsof -t -i:3000)

# Check port availability
nc -zv localhost 3000
nc -zv localhost 8080
nc -zv localhost 3306
```

### Process Management

```bash
# Find process
ps aux | grep node
ps aux | grep mysql

# Kill process
kill <pid>
kill -9 <pid>  # Force kill

# Process tree
pstree -p | grep node

# Resource usage
top
htop
```

### File Operations

```bash
# Find files
find . -name "*.js" -type f
find . -name "*.log" -type f -mtime +7

# Search content
grep -r "TODO" .
grep -r "console.log" src/
grep -i "error" logs/

# Disk usage
du -sh *
du -sh .[^.]*
df -h

# Directory size
du -sh node_modules/
du -sh uploads/
```

### Network Tools

```bash
# Ping
ping localhost
ping google.com

# DNS lookup
nslookup localhost
nslookup google.com

# Traceroute
traceroute google.com

# HTTP testing
wget -O - http://localhost:8080/api/health
curl -s http://localhost:8080/api/health | jq '.'
```

---

## Quick Reference Card

### Startup Sequence

```bash
# Start everything
docker-compose up -d

# Verify
docker-compose ps
curl http://localhost:8080/api/health
```

### Debug Sequence

```bash
# 1. Check logs
docker-compose logs -f

# 2. Test API
curl http://localhost:8080/api/health

# 3. Check database
docker-compose exec mysql mysql -u root -ppassword -e "SELECT COUNT(*) FROM career_assessment.assessments;"

# 4. Verify network
docker-compose exec backend ping mysql
```

### Emergency Commands

```bash
# Complete restart
docker-compose down
docker-compose up -d --build

# Reset database
docker-compose down -v
docker-compose up -d mysql

# Clean everything
docker system prune -a --volumes
docker-compose up -d --build
```

### Daily Operations

```bash
# View logs
docker-compose logs -f backend

# Check stats
docker-compose stats

# Backup
docker-compose exec mysql mysqldump -u root -ppassword career_assessment > backup.sql

# Git
git add . && git commit -m "Update" && git push
```

---

**End of Manual** - Return to [README.md](README.md) for overview