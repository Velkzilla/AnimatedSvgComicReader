// === 配置 ===
const CONFIG = {
  svgPath: 'main.svg',
  layerCount: 15,
  scrollHeightPerLayer: 100, // vh
  fadeDuration: 800, // ms
};

// === 图层名称（按序） ===
const LAYERS = [
  '0000P0', '0001P1', '0002P2', '0003D0', '0004D1',
  '0005P3', '0006P4', '0007D3', '0008D4', '0009P5',
  '0010P6', '0011D5', '0012D6', '0013D7', '0014D8'
];

// === 全局引用 ===
let svgDocument = null;
let scrollContainer = null;

// === 初始化 ===
async function init() {
  try {
    console.log('🚀 开始初始化...');
    scrollContainer = document.getElementById('scrollContainer');

    await loadSVG();
    prepareLayers();
    setupScrollContainer();
    setupProgressTracking();

    document.body.classList.add('loaded');

    // 确保页面从顶部开始（延迟执行以确保生效）
    setTimeout(() => {
      scrollContainer.scrollTop = 0;
      console.log('🔝 强制重置滚动位置到顶部');
    }, 100);

    console.log('✅ 初始化完成');
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    alert('初始化失败: ' + error.message + '\n\n请检查控制台获取详细信息。');
  }
}

// === 1. 加载SVG ===
async function loadSVG() {
  console.log('开始加载SVG:', CONFIG.svgPath);

  const response = await fetch(CONFIG.svgPath);

  if (!response.ok) {
    throw new Error(`SVG加载失败: ${response.status} ${response.statusText}`);
  }

  const svgText = await response.text();
  console.log('SVG文本长度:', svgText.length);

  const wrapper = document.getElementById('svgWrapper');
  wrapper.innerHTML = svgText;

  svgDocument = wrapper.querySelector('svg');

  if (!svgDocument) {
    throw new Error('未找到SVG元素');
  }

  console.log('SVG已加载:', svgDocument.viewBox.baseVal);
  console.log('SVG尺寸:', svgDocument.getAttribute('width'), 'x', svgDocument.getAttribute('height'));

  // 确保SVG可见
  svgDocument.style.display = 'block';
  svgDocument.style.maxWidth = '100%';
  svgDocument.style.maxHeight = '100%';

  console.log('SVG在DOM中的位置:', wrapper.getBoundingClientRect());
}

// === 2. 准备图层 ===
function prepareLayers() {
  LAYERS.forEach((layerName, index) => {
    const layer = svgDocument.querySelector(`g[inkscape\\:label="${layerName}"]`);

    if (!layer) {
      console.warn(`⚠️ 图层未找到: ${layerName}`);
      return;
    }

    // 所有图层初始隐藏
    layer.style.opacity = '0';
    // 不要对SVG元素使用CSS transform，会导致错位
    // layer.style.transform = 'translateZ(0)';
    layer.style.transition = 'opacity 0.3s ease'; // 添加过渡效果
    layer.style.willChange = 'opacity'; // 硬件加速优化
    layer.setAttribute('data-layer-index', index);

    console.log(`✓ 图层 ${index + 1}/15: ${layerName}`);
  });
}

// === 3. 设置滚动容器 ===
function setupScrollContainer() {
  const scrollContent = scrollContainer.querySelector('.scroll-content');
  const totalHeight = (CONFIG.layerCount * CONFIG.scrollHeightPerLayer) + 100;
  scrollContent.style.height = `${totalHeight}vh`;

  // 确保滚动位置从顶部开始
  scrollContainer.scrollTop = 0;

  console.log(`滚动高度: ${totalHeight}vh`);
  console.log(`初始滚动位置: ${scrollContainer.scrollTop}px`);
}

// === 4. 显示图层（根据滚动位置） ===
function showLayersUpTo(currentPage) {
  LAYERS.forEach((layerName, index) => {
    const layer = svgDocument.querySelector(`g[inkscape\\:label="${layerName}"]`);
    if (!layer) return;

    // 显示从第1页到当前页的所有图层
    if (index < currentPage) {
      layer.style.opacity = '1';
    } else {
      layer.style.opacity = '0';
    }
  });
}

// === 5. 进度跟踪和图层显示 ===
function setupProgressTracking() {
  const progressFill = document.querySelector('.progress-bar-fill');
  const currentPageSpan = document.querySelector('.current-page');
  const totalPagesSpan = document.querySelector('.total-pages');

  totalPagesSpan.textContent = CONFIG.layerCount;

  let scrollEventCount = 0;
  scrollContainer.addEventListener('scroll', () => {
    const scrollTop = scrollContainer.scrollTop;
    const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
    const scrollPercent = (scrollTop / scrollHeight) * 100;

    // 调试日志（只显示前几次）
    if (scrollEventCount < 5) {
      console.log(`📜 滚动事件 #${++scrollEventCount}: ${scrollPercent.toFixed(2)}%`);
    }

    // 更新进度条
    progressFill.style.width = `${scrollPercent}%`;

    // 计算当前页码
    const currentPage = Math.min(
      Math.floor((scrollPercent / 100) * CONFIG.layerCount) + 1,
      CONFIG.layerCount
    );
    currentPageSpan.textContent = currentPage;

    // 显示从第1页到当前页的所有图层
    showLayersUpTo(currentPage);
  });

  // 初始显示第一页
  showLayersUpTo(1);
  currentPageSpan.textContent = 1;
  progressFill.style.width = '0%';

  console.log('✅ 进度跟踪已设置，初始状态：第1页');
}

// === 启动 ===
init();
