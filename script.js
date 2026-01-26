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

    // 初始化社交统计（如果要加的话）
    initSocialFunctions(); 
    
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
// ===== 简单稳定版音乐控制 =====
function initSimpleMusic() {
    const audio = document.getElementById('bgm');
    const toggleBtn = document.getElementById('music-toggle');
    
    if (!audio || !toggleBtn) {
        console.log('❌ 找不到音乐元素');
        return;
    }
    
    console.log('🎵 初始化音乐播放器...');
    
    // 基础设置
    audio.volume = 0.3;
    audio.loop = true;
    audio.preload = 'auto'; // 让浏览器决定如何预加载
    
    // 立即显示正常按钮（不显示加载）
    toggleBtn.innerHTML = '<i class="fas fa-volume-up"></i><i class="fas fa-volume-mute"></i>';
    toggleBtn.title = '点击播放音乐';
    toggleBtn.classList.add('muted'); // 初始为暂停状态
    
    // 移除任何加载动画
    toggleBtn.style.animation = '';
    
    // 标记是否已经提示过用户
    let hasShownHint = false;
    
    // 简单的点击控制函数
    async function toggleMusic() {
        try {
            if (audio.paused) {
                // 尝试播放
                await audio.play();
                console.log('▶️ 音乐播放成功');
                toggleBtn.classList.remove('muted');
                toggleBtn.title = '点击暂停音乐';
            } else {
                // 暂停
                audio.pause();
                console.log('⏸️ 音乐已暂停');
                toggleBtn.classList.add('muted');
                toggleBtn.title = '点击播放音乐';
            }
        } catch (error) {
            console.log('⚠️ 播放失败:', error.message);
            
            // 如果是自动播放被阻止，提示用户
            if (error.name === 'NotAllowedError' && !hasShownHint) {
                hasShownHint = true;
                
                // 显示友好提示
                toggleBtn.title = '请先点击页面任意位置';
                toggleBtn.style.animation = 'pulse 1.5s infinite';
                toggleBtn.style.background = 'rgba(255, 193, 7, 0.9)';
                
                // 添加一次性页面点击监听
                const enableMusic = () => {
                    toggleBtn.style.animation = '';
                    toggleBtn.style.background = '';
                    toggleBtn.title = '点击播放音乐';
                    
                    // 用户交互后可以播放了
                    document.hasUserInteracted = true;
                };
                
                document.addEventListener('click', enableMusic, { once: true });
                document.addEventListener('touchstart', enableMusic, { once: true });
                document.addEventListener('keydown', enableMusic, { once: true });
                
                // 5秒后自动恢复
                setTimeout(() => {
                    toggleBtn.style.animation = '';
                    toggleBtn.style.background = '';
                    toggleBtn.title = '点击播放音乐';
                }, 5000);
            }
        }
    }
    
    // 按钮点击事件
    toggleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMusic();
    });
    
    // 页面可见性变化时暂停/继续
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // 页面隐藏时暂停
            if (!audio.paused) {
                audio.dataset.wasPlaying = 'true';
                audio.pause();
                toggleBtn.classList.add('muted');
            }
        } else if (audio.dataset.wasPlaying === 'true') {
            // 页面恢复时继续播放
            setTimeout(() => {
                audio.play().then(() => {
                    toggleBtn.classList.remove('muted');
                    delete audio.dataset.wasPlaying;
                });
            }, 300);
        }
    });
    
    // 加载完成时更新状态
    audio.addEventListener('canplay', function() {
        console.log('✅ 音乐可以播放了');
        // 如果之前是播放状态，尝试恢复
        if (audio.dataset.shouldPlay === 'true') {
            audio.play().then(() => {
                toggleBtn.classList.remove('muted');
                delete audio.dataset.shouldPlay;
            });
        }
    });
    
    // 加载失败处理
    audio.addEventListener('error', function() {
        console.error('❌ 音乐加载失败');
        toggleBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
        toggleBtn.title = '音乐加载失败';
        toggleBtn.style.background = '#ff4444';
        toggleBtn.onclick = null; // 禁用点击
    });
    
    // 如果用户已经交互过，尝试自动播放
    if (document.hasUserInteracted) {
        setTimeout(() => {
            audio.play().then(() => {
                toggleBtn.classList.remove('muted');
                toggleBtn.title = '点击暂停音乐';
            });
        }, 1000);
    }
    
    console.log('🎵 音乐播放器初始化完成');
}// ===== 社交链接功能 =====
function trackSocialClick(platform) {
    console.log(`📊 社交链接点击: ${platform}`);
    
    // 本地记录（localStorage）
    try {
        let socialStats = JSON.parse(localStorage.getItem('blog_social_stats') || '{}');
        socialStats[platform] = (socialStats[platform] || 0) + 1;
        socialStats.total = (socialStats.total || 0) + 1;
        socialStats.lastClick = new Date().toISOString();
        localStorage.setItem('blog_social_stats', JSON.stringify(socialStats));
        
        console.log('📈 社交统计更新:', socialStats);
    } catch (e) {
        console.log('统计保存失败:', e);
    }
}

// 只有一个 showContactModal 函数！
function showContactModal() {
    const modalHTML = `
        <div class="contact-modal" id="contactModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📫 联系我</h3>
                    <button class="close-modal" onclick="closeContactModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="contact-method">
                        <i class="fas fa-envelope"></i>
                        <div>
                            <h4>邮箱</h4>
                            <p>2045856582@qq.com</p>
                            <button class="copy-btn" onclick="copyToClipboard('你的邮箱@example.com', 'email')">
                                复制邮箱
                            </button>
                        </div>
                    </div>
                    <div class="contact-method">
                        <i class="fab fa-weixin"></i>
                        <div>
                            <h4>微信</h4>
                            <p>不告诉你</p>
                        </div>
                    </div>
                    <div class="contact-method">
                        <i class="fab fa-qq"></i>
                        <div>
                            <h4>QQ</h4>
                            <p>2045856582</p>
                            <button class="copy-btn" onclick="copyToClipboard('你的QQ号', 'qq')">
                                复制QQ号
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <p>通常会在24小时内回复 😊</p>
                </div>
            </div>
        </div>
    `;
    
    // 添加模态框到页面
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 点击模态框背景关闭
    document.getElementById('contactModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeContactModal();
        }
    });
}

function closeContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.remove();
    }
}

function copyToClipboard(text, type) {
    navigator.clipboard.writeText(text).then(() => {
        alert(`已复制${type === 'email' ? '邮箱地址' : 'QQ号'}到剪贴板`);
        trackSocialClick(`copy_${type}`);
    }).catch(err => {
        console.error('复制失败:', err);
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert(`已复制${type === 'email' ? '邮箱地址' : 'QQ号'}到剪贴板`);
    });
}

// ===== 键盘快捷键 =====
document.addEventListener('keydown', function(e) {
    // ESC键关闭模态框
    if (e.key === 'Escape') {
        closeContactModal();
    }
    
    // Ctrl+G 打开GitHub
    if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        window.open('https://github.com/你的用户名', '_blank');
        trackSocialClick('github_keyboard');
    }
});
function copyEmailDirect() {
    const email = '2045856582@qq.com';
    copyToClipboard(email, 'email');
    trackSocialClick('email_copy');
}
// ===== 邮箱复制功能 =====
function copyEmailDirect(e) {
    e.preventDefault(); // 阻止默认行为（重要！）
    
    const email = '2045856582@qq.com'; // 替换为你的真实邮箱
    
    // 使用现有的copyToClipboard函数
    copyToClipboard(email, 'email');
    
    // 显示一个友好的提示（代替alert）
    showCopyToast('📧 邮箱地址已复制到剪贴板！');
}

// 漂亮的通知提示
function showCopyToast(message) {
    // 移除现有的提示（如果有）
    const existingToast = document.querySelector('.copy-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 创建新提示
    const toast = document.createElement('div');
    toast.className = 'copy-toast';
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    // 添加到页面
    document.body.appendChild(toast);
    
    // 3秒后自动消失
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
