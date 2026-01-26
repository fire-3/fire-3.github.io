// ===== 主题切换功能 =====
const themeToggle = document.getElementById('theme-toggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // 触发主题变化事件（用于粒子效果）
    document.dispatchEvent(new CustomEvent('themeChange', { detail: { theme } }));
    
    // 更新按钮图标
    updateThemeButton(theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

// 更新按钮显示
function updateThemeButton(theme) {
    if (!themeToggle) return;
    
    const moonIcon = themeToggle.querySelector('.fa-moon');
    const sunIcon = themeToggle.querySelector('.fa-sun');
    
    if (theme === 'dark') {
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'inline-block';
        themeToggle.setAttribute('title', '切换到浅色模式');
    } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'inline-block';
        themeToggle.setAttribute('title', '切换到深色模式');
    }
}

// 初始化主题
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    setTheme(savedTheme);
} else if (prefersDarkScheme.matches) {
    setTheme('dark');
} else {
    setTheme('light'); // 确保始终有主题
}

// 主题按钮事件监听
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

// ===== 增强粒子效果（配合图片背景） =====
function initParticles() {
    const canvas = document.getElementById('particles-bg');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, radius: 100 };
    let animationId = null;
    
    // 设置canvas尺寸
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    // 鼠标移动追踪
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });
    
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });
    
    // 粒子类
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.baseSize = this.size;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.density = Math.random() * 10 + 5;
            
            // 根据主题设置颜色
            this.updateColor();
        }
        
        updateColor() {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            this.baseColor = isDark 
                ? `hsla(${Math.random() * 60 + 200}, 70%, 70%, 0.7)`  // 蓝紫色调
                : `hsla(${Math.random() * 60 + 180}, 80%, 60%, 0.5)`; // 青蓝色调
            this.color = this.baseColor;
        }
        
        update() {
            // 鼠标互动
            if (mouse.x && mouse.y) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const directionX = forceDirectionX * force * this.density * 0.5;
                    const directionY = forceDirectionY * force * this.density * 0.5;
                    
                    this.x -= directionX;
                    this.y -= directionY;
                    
                    // 靠近鼠标时变大
                    this.size = this.baseSize * (1 + force * 0.5);
                    this.color = this.baseColor.replace('0.7', '0.9').replace('0.5', '0.8');
                } else {
                    this.size = this.baseSize;
                    this.color = this.baseColor;
                }
            }
            
            // 边界反弹
            if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
            if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
            
            // 随机漂移
            this.x += this.speedX + (Math.random() - 0.5) * 0.2;
            this.y += this.speedY + (Math.random() - 0.5) * 0.2;
            
            // 确保在边界内
            this.x = Math.max(0, Math.min(canvas.width, this.x));
            this.y = Math.max(0, Math.min(canvas.height, this.y));
        }
        
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            
            // 添加发光效果
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
    
    // 创建粒子
    function createParticles() {
        particles = [];
        const particleCount = Math.floor((canvas.width * canvas.height) / 8000);
        
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }
    
    // 连接粒子
    function connectParticles() {
        const maxDistance = document.documentElement.getAttribute('data-theme') === 'dark' ? 150 : 120;
        
        for (let i = 0; i < particles.length; i++) {
            for (let j = i; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < maxDistance) {
                    const opacity = 0.2 * (1 - distance / maxDistance);
                    ctx.strokeStyle = document.documentElement.getAttribute('data-theme') === 'dark'
                        ? `rgba(180, 200, 255, ${opacity})`
                        : `rgba(100, 150, 255, ${opacity})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    // 动画循环
    function animateParticles() {
        // 使用半透明填充创建拖尾效果
        ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'dark'
            ? 'rgba(0, 0, 0, 0.03)'
            : 'rgba(255, 255, 255, 0.03)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        connectParticles();
        animationId = requestAnimationFrame(animateParticles);
    }
    
    // 停止粒子动画
    function stopParticles() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }
    
    // 重新开始粒子动画
    function restartParticles() {
        stopParticles();
        animateParticles();
    }
    
    // 初始化
    function init() {
        resizeCanvas();
        createParticles();
        animateParticles();
    }
    
    // 重置（窗口大小改变或主题切换时）
    function reset() {
        stopParticles();
        resizeCanvas();
        createParticles();
        animateParticles();
    }
    
    // 窗口大小改变时重置
    window.addEventListener('resize', reset);
    
    // 主题切换时重置
    document.addEventListener('themeChange', () => {
        particles.forEach(p => p.updateColor());
        // 短暂延迟确保主题已完全切换
        setTimeout(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 50);
    });
    
    // 页面可见性改变时暂停/继续
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopParticles();
        } else {
            restartParticles();
        }
    });
    
    // 初始化
    init();
    
    // 返回重置函数供外部调用
    return { reset };
}

// ===== 页面初始化 =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('博客加载完成');
    
    // 初始化粒子效果
    const particlesController = initParticles();

    //初始化音乐播放器
    initSimpleMusic();
    
    // 简单的搜索功能（可按需实现）
    function searchArticles() {
        const searchInput = document.querySelector('.search-widget input');
        if (searchInput) {
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const query = this.value.trim();
                    if (query) {
                        alert(`搜索功能尚未实现，搜索词：${query}`);
                        // 这里可以添加实际搜索逻辑
                    }
                }
            });
        }
    }
    
    // 移动端菜单切换
    function initMobileMenu() {
        const menuToggle = document.createElement('button');
        menuToggle.className = 'mobile-menu-toggle';
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        menuToggle.setAttribute('aria-label', '菜单');
        
        const nav = document.querySelector('.site-nav');
        if (nav && window.innerWidth <= 768) {
            const headerContent = document.querySelector('.header-content');
            headerContent.appendChild(menuToggle);
            
            menuToggle.addEventListener('click', () => {
                nav.classList.toggle('active');
                menuToggle.innerHTML = nav.classList.contains('active') 
                    ? '<i class="fas fa-times"></i>' 
                    : '<i class="fas fa-bars"></i>';
            });
            
            // 点击菜单项关闭菜单
            nav.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', () => {
                    nav.classList.remove('active');
                    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                });
            });
        }
    }
    
    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#!') return;
            
            const targetElement = document.querySelector(href);
            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 初始化功能
    searchArticles();
    initMobileMenu();
    
    // 性能优化：图片懒加载
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // 控制台欢迎信息
    console.log('%c✨ 欢迎来到炎诉的学习博客 ✨', 
        'color: #4a6fa5; font-size: 16px; font-weight: bold;'
    );
    console.log('%c好好学习，天天向上！', 
        'color: #666; font-size: 14px;'
    );
});

// ===== 窗口大小改变时重新布局 =====
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // 重新检查是否需要移动端菜单
        const nav = document.querySelector('.site-nav');
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        
        if (window.innerWidth > 768 && nav && menuToggle) {
            nav.classList.remove('active');
            menuToggle.remove();
        } else if (window.innerWidth <= 768 && nav && !menuToggle) {
            // 重新初始化移动端菜单
            const initMobileMenu = () => {
                // 移动端菜单初始化代码...
            };
            initMobileMenu();
        }
    }, 250);
});

// ===== 主题切换按钮样式增强 =====
// 确保主题切换按钮有基本样式
if (themeToggle) {
    themeToggle.style.cssText = `
        background: none;
        border: 1px solid var(--border-color);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-color);
        transition: all 0.3s ease;
        position: relative;
    `;
    
    themeToggle.innerHTML = `
        <i class="fas fa-moon" style="position: absolute;"></i>
        <i class="fas fa-sun" style="position: absolute; display: none;"></i>
    `;
    
    // 初始更新按钮状态
    updateThemeButton(document.documentElement.getAttribute('data-theme'));
}
// ===== 极简音乐控制 =====
function initSimpleMusic() {
    const audio = document.getElementById('bgm');
    const toggleBtn = document.getElementById('music-toggle');
    
    if (!audio || !toggleBtn) return;
    
    // 设置默认音量（避免太吵）
    audio.volume = 0.2;
    
    // 自动播放（现代浏览器需要用户交互）
    let userInteracted = false;
    
    function tryAutoPlay() {
        if (!userInteracted) {
            audio.play().then(() => {
                console.log('音乐自动播放成功');
            }).catch(error => {
                console.log('自动播放被阻止，需要用户点击页面');
                // 显示提示
                toggleBtn.style.animation = 'pulse 2s infinite';
                toggleBtn.title = '点击页面任意处启用音乐';
            });
        }
    }
    
    // 页面首次点击时启用音乐
    document.addEventListener('click', () => {
        if (!userInteracted) {
            userInteracted = true;
            audio.play();
            toggleBtn.style.animation = '';
            toggleBtn.title = '点击暂停音乐';
        }
    }, { once: true });
    
    // 按钮点击切换播放/暂停
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // 防止触发上面的document点击
        
        if (audio.paused) {
            audio.play();
            toggleBtn.classList.remove('muted');
            toggleBtn.title = '点击暂停音乐';
        } else {
            audio.pause();
            toggleBtn.classList.add('muted');
            toggleBtn.title = '点击播放音乐';
        }
    });
    
    // 页面离开时自动暂停（省电）
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (!audio.paused) {
                audio.dataset.wasPlaying = 'true';
                audio.pause();
                toggleBtn.classList.add('muted');
            }
        } else if (audio.dataset.wasPlaying === 'true') {
            audio.play();
            toggleBtn.classList.remove('muted');
            delete audio.dataset.wasPlaying;
        }
    });
    
    // 添加脉动动画样式
    if (!document.querySelector('#pulse-style')) {
        const style = document.createElement('style');
        style.id = 'pulse-style';
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // 尝试自动播放
    setTimeout(tryAutoPlay, 1000);
}

// ===== 然后在DOMContentLoaded事件中调用它 =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('博客加载完成');
    
    // 初始化粒子效果
    const particlesController = initParticles();
    
    // 初始化音乐播放器 ⬅️ 添加这一行！
    initSimpleMusic();
    
    // ... 其他初始化代码 ...
});
