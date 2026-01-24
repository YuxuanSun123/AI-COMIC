# 变更日志 (CHANGELOG)

本文档记录 AICM Workshop 项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [2.8.0] - 2026-01-19

### 新增 (Added)

#### 剪辑合成完整联动工作流
- 实现剪辑合成（#/tools/edit）的完整联动工作流
- 左栏：来源镜头卡下拉选择（仅显示type=video_cards），自动选中source_video_cards_id，显示来源摘要信息（标题/题材/语言/镜头卡数/来源分镜）
- 中栏：作品标题输入+按钮行（生成剪辑清单/保存/另存为/导出TXT/导出JSON）+剪辑清单编辑器（每条item包含item_no/shot_ref/source_prompt_ref/asset_need/voice_sfx/transition/duration_sec/caption_subtitle/notes，支持编辑/增删/排序/重新编号）
- 右栏：生成参数（pace/target_total_sec/transition_style/audio_style/subtitle_density/temperature）+统计信息（剪辑条目/总时长/来源镜头卡）
- 剪辑清单编辑器：与cards一一对应，每条item可单独编辑所有字段，支持新增/删除/上移/下移/重新编号
- 自动载入：URL query或localStorage有source_video_cards_id时自动选中并载入镜头卡
- Studio联动：edit_plan作品点击标题跳转#/tools/edit?open_id=xxx自动载入

#### AI客户端增强
- 实现generateEditPlan方法（src/lib/aiClient.ts）
- 定义GenerateEditPlanPayload类型（user/lang/genre/source包含video_cards_id/cards/params_from_video_cards、params包含pace/target_total_sec/transition_style/audio_style/subtitle_density/temperature、meta）
- 定义EditPlanGenerationResult类型（items[]）
- USE_REAL_API=false时调用mockGenerateEditPlan
- API约定：POST /api/generate/edit-plan，返回{ok, data:{items}}

#### Mock生成器增强
- 实现mockGenerateEditPlan方法（src/lib/mockGenerator.ts，400行）
- 一条card → 一条item（数量一致）
- 时长分配规则：根据pace确定base（slow 3.5/normal 2.5/fast 1.8），根据card内容关键词加权（打斗/爆炸/追逐/冲突 +0.6，情绪/沉默/凝视/回忆 +0.4，转场/闪回/蒙太奇 +0.3），按比例缩放到target_total_sec，修正误差（+1或-1直到total_sec==target_total_sec）
- 转场生成规则：根据transition_style确定概率分布（clean 80% cut 20% fade，cinematic 60% cut 30% fade 10% flash，dynamic 50% cut 25% whip 15% flash 10% glitch），根据lighting_mood/情绪偏置（紧张/惊悚/追逐偏向cut/whip/flash，抒情/回忆/温柔偏向fade）
- voice_sfx生成规则：从dialogue_voiceover提取对白/旁白，根据audio_style生成环境音（rich/dramatic时生成，minimal时不生成），环境音根据场景关键词生成（night夜风/虫鸣/远处车流，street人群嘈杂/车流/脚步声，rain雨声/雷声/水滴，indoor空调/脚步回声/门响，tech电流/机械运转/电子音，nature鸟鸣/风声/流水）
- caption_subtitle生成规则：从dialogue_voiceover提取，根据subtitle_density控制长度（low ≤12字，mid ≤18字，high ≤26字），移除"旁白："、"对白："等前缀
- asset_need生成规则：合成visual_desc + character_action + lighting_mood
- 支持中英文：lang=en时所有字段内容英文一致

#### 固化数据结构（用于工具联动）
- 定义EnhancedEditPlanContent类型（works.content for type=edit_plan）
- 包含：lang、genre、source（video_cards_id/video_cards_title/card_count/storyboard_id）、params、items[]、totals（total_items/total_sec）
- source.video_cards_id：若来自镜头卡则必填
- items[]：剪辑合成的直接输入
- totals.total_sec：items.duration_sec之和（保存时重算）
- 定义EditPlanParams类型：pace、target_total_sec、transition_style、audio_style、subtitle_density、temperature
- 定义EnhancedEditItem类型：item_no、shot_ref、source_prompt_ref、asset_need、voice_sfx、transition、duration_sec、caption_subtitle、notes

#### 导出功能实现
- 导出TXT：适合发剪辑师，格式包含项目名/总时长/镜头数，每条item包含序号/时长/转场/素材/声音/字幕/备注
- 导出JSON：直接导出EnhancedEditPlanContent结构，可用于程序化处理
- 使用Blob + a.download实现文件下载

### 优化 (Improved)

#### 类型定义增强
- Work类型支持EnhancedEditPlanContent
- 添加EditPlanParams类型
- 添加EnhancedEditItem类型

#### 用户体验优化
- 来源镜头卡选择：下拉列表仅显示当前用户的镜头卡作品
- 镜头卡信息展示：显示标题、题材、语言、镜头卡数、来源分镜
- 剪辑条目编辑：可视化增删改排序，每个条目独立卡片
- 重新编号：一键重新编号所有条目
- 生成状态：loading状态显示，错误提示友好
- 统计信息：显示剪辑条目数、总时长、来源镜头卡数
- 导出功能：支持TXT和JSON两种格式

#### 完整数据流水线
- Script（剧本 + scenes）→ Storyboard（分镜 + shots）→ Video Cards（镜头卡 + AI Prompt）→ Edit Plan（剪辑清单 + 时长/转场/音效/字幕）
- 每个环节数据结构固化，确保无缝衔接
- 支持从任意环节载入并继续编辑

---

## [2.7.0] - 2026-01-19

### 新增 (Added)

#### 镜头卡生成器完整联动工作流
- 实现镜头卡生成器（#/tools/video）的完整联动工作流
- 左栏：来源分镜下拉选择（仅显示type=storyboard），自动选中source_storyboard_id，显示分镜摘要信息（标题/题材/语言/镜头数/来源剧本）
- 中栏：作品标题输入+按钮行（生成镜头卡/保存/另存为/生成剪辑清单）+镜头卡列表编辑器（每条card包含card_no/shot_ref/visual_desc/character_action/lighting_mood/camera_desc/dialogue_voiceover/prompt/negative_prompt/notes，支持编辑/增删/排序/重新生成Prompt）
- 右栏：Prompt生成参数（render_style/character_consistency/detail_level/camera_emphasis/temperature）+统计信息（镜头卡数/来源镜头）
- 镜头卡列表编辑器：与shots一一对应，每条card可单独编辑所有字段，支持新增/删除/上移/下移/重新编号/重新生成Prompt
- 自动载入：URL query或localStorage有source_storyboard_id时自动选中并载入分镜
- Studio联动：video_cards作品点击标题跳转#/tools/video?open_id=xxx自动载入

#### AI客户端增强
- 实现generateVideoCards方法（src/lib/aiClient.ts）
- 定义GenerateVideoCardsPayload类型（user/lang/genre/source包含storyboard_id/shots、params包含render_style/character_consistency/detail_level/camera_emphasis/temperature、meta）
- 定义VideoCardsGenerationResult类型（cards[]）
- USE_REAL_API=false时调用mockGenerateVideoCards
- API约定：POST /api/generate/video-cards，返回{ok, data:{cards}}

#### Mock生成器增强
- 实现mockGenerateVideoCards方法（src/lib/mockGenerator.ts，250行）
- 一条shot → 一条card（数量一致）
- 拆解shot信息到card各字段：visual_desc（从frame提取）、character_action（从action提取）、lighting_mood（根据genre生成）、camera_desc（从camera提取）、dialogue_voiceover（从dialogue提取）
- Prompt拼接规则：[render_style], [visual_desc], [character_action], [lighting_mood], [camera_desc], [emotion/atmosphere], high quality, cinematic composition, (character consistency hint), (detail level hint)
- 根据params影响结果：render_style决定整体风格词、character_consistency=high加入"角色形象高度一致/consistent character design"、detail_level=high加入"细节丰富/highly detailed"、camera_emphasis=strong/mid时包含camera_desc
- 支持中英文：lang=en时所有prompt为英文，拼接用逗号
- negative_prompt默认空字符串

#### 固化数据结构（用于工具联动）
- 定义EnhancedVideoCardsContent类型（works.content for type=video_cards）
- 包含：lang、genre、source（storyboard_id/storyboard_title/shot_count）、params、cards[]、updated_from
- source.storyboard_id：若来自分镜则必填
- cards[]：剪辑合成模块的直接输入
- prompt：可直接丢给AI生图/生视频模型的完整文本
- 定义VideoCardsParams类型：render_style、character_consistency、detail_level、camera_emphasis、temperature
- 定义EnhancedVideoCard类型：card_no、shot_ref、visual_desc、character_action、lighting_mood、camera_desc、dialogue_voiceover、prompt、negative_prompt、notes

#### Prompt拼接规则实现
- buildPrompt函数：按顺序拼接[render_style], [visual_desc], [character_action], [lighting_mood], [camera_desc], [emotion/atmosphere], high quality, cinematic composition, (character consistency hint), (detail level hint)
- inferEmotion函数：根据题材推断情绪氛围（romance浪漫温馨/scifi科幻未来感/mystery紧张悬疑/thriller惊悚紧张/campus青春活力/family温馨家庭）
- generateLightingMood函数：根据题材生成光影氛围（romance柔和暖光/scifi冷色调科技感/mystery阴影重重/thriller黑暗压抑/campus明亮清新/family温馨柔和）
- 中英文模式：isZh=true用逗号拼接中文词，isZh=false用逗号拼接英文词

#### 工具联动入口
- "生成剪辑清单"按钮：跳转到#/tools/edit
- 使用localStorage传递source_video_cards_id（last_source_video_cards_id）
- 剪辑合成可自动选中该镜头卡作为输入来源

### 优化 (Improved)

#### 类型定义增强
- Work类型支持EnhancedVideoCardsContent
- 添加VideoCardsParams类型
- 添加EnhancedVideoCard类型

#### 用户体验优化
- 来源分镜选择：下拉列表仅显示当前用户的分镜作品
- 分镜信息展示：显示标题、题材、语言、镜头数、来源剧本
- 镜头卡编辑：可视化增删改排序，每个镜头卡独立卡片
- 重新生成Prompt：单个镜头卡可一键重新生成Prompt
- 重新编号：一键重新编号所有镜头卡
- 生成状态：loading状态显示，错误提示友好
- 统计信息：显示镜头卡数、来源镜头数

---

## [2.6.0] - 2026-01-19

### 新增 (Added)

#### 分镜生成器完整联动工作流
- 实现分镜生成器（#/tools/storyboard）的完整联动工作流
- 左栏：来源剧本下拉选择（仅显示type=script），自动选中source_script_id，显示剧本基础信息（标题/题材/语言/更新时间/场景数）
- 中栏：输入区（来源剧本预览或粘贴剧本片段）+按钮行（生成分镜/保存/另存为/生成镜头卡）+分镜列表编辑器（可编辑卡片，支持增删排序）
- 右栏：参数面板（shot_density/visual_style/camera_variety/temperature/max_shots）+统计信息（镜头数/总时长/来源场景）
- 分镜列表编辑器：每条shot包含shot_no/scene_ref/frame/action/camera/dialogue/duration_sec/notes，支持新增/删除/上移/下移/重新编号
- 自动载入：URL query或localStorage有source_script_id时自动选中并载入剧本
- Studio联动：storyboard作品点击标题跳转#/tools/storyboard?open_id=xxx自动载入

#### AI客户端增强
- 实现generateStoryboard方法（src/lib/aiClient.ts）
- 定义GenerateStoryboardPayload类型（user/lang/genre/source/fallback_text/params/meta）
- 定义StoryboardGenerationResult类型（shots[]）
- USE_REAL_API=false时调用mockGenerateStoryboard
- API约定：POST /api/generate/storyboard，返回{ok, data:{shots}}

#### Mock生成器增强
- 实现mockGenerateStoryboard方法（src/lib/mockGenerator.ts）
- 根据source.scenes生成shots（每个scene生成3-6个shots，由shot_density控制）
- scene_ref写入对应scene_no
- frame/action/dialogue/camera都生成非空内容
- camera多样化（由camera_variety控制）：低（固定中景/近景）、中（加入全景/特写/跟拍/推拉摇移）、高（再加入俯拍/仰拍/手持抖动/长镜头/景深变化/斯坦尼康/航拍）
- max_shots严格裁剪总镜头数
- 支持中英文：lang=en时字段内容英文一致
- duration_sec默认3-6秒随机

#### 固化数据结构（用于工具联动）
- 定义EnhancedStoryboardContent类型（works.content for type=storyboard）
- 包含：lang、genre、source（script_id/script_title/script_updated_ms）、params、shots[]、updated_from
- source.script_id：若来自剧本则必填，若粘贴剧本片段则为null
- shots[]：后续Video Cards的唯一输入来源
- 定义StoryboardParams类型：shot_density、visual_style、camera_variety、temperature、max_shots
- 定义EnhancedShot类型：shot_no、scene_ref、frame、action、camera、dialogue、duration_sec、notes

#### 工具联动入口
- "生成镜头卡"按钮：跳转到#/tools/video
- 使用localStorage传递source_storyboard_id（last_source_storyboard_id）
- 镜头卡生成器可自动选中该分镜作为输入来源

### 优化 (Improved)

#### 类型定义增强
- Work类型支持EnhancedStoryboardContent
- 添加StoryboardParams类型
- 添加EnhancedShot类型

#### 用户体验优化
- 来源剧本选择：下拉列表仅显示当前用户的剧本作品
- 剧本信息展示：显示标题、题材、语言、更新时间、场景数
- 分镜编辑：可视化增删改排序，每个镜头独立卡片
- 重新编号：一键重新编号所有镜头
- 生成状态：loading状态显示，错误提示友好
- 统计信息：显示镜头数、总时长、来源场景数

---

## [2.5.0] - 2026-01-19

### 新增 (Added)

#### 剧本生成器完整工作流
- 实现真实的剧本生成工作流（#/tools/script）
- 左栏：题材类型选择、语言选择（中/英）、来源作品选择（载入已有剧本）
- 中栏：作者输入表单（logline、world、characters、constraints）+ 生成按钮 + 结果编辑器
- 右栏：参数面板（length_level、pace、temperature、style_tag）+ 统计信息
- 角色管理：可增删角色，每个角色包含name/traits/relation三个字段
- 生成按钮：调用AI客户端生成剧本（默认使用mock）
- 结果编辑器：生成后可手动编辑剧本文字
- 操作按钮：保存、另存为、生成分镜（跳转到分镜生成器）

#### AI客户端模块
- 创建aiClient模块（src/lib/aiClient.ts）
- 预留真实API接口（USE_REAL_API=false，默认关闭）
- generateScript方法：接收payload，返回剧本生成结果
- 预留其他方法：generateStoryboard、generateVideoCards、generateEditPlan（暂未实现）
- API约定：POST /api/generate/script，返回{ok, data/error}

#### Mock生成器
- 创建mockGenerator模块（src/lib/mockGenerator.ts）
- mockGenerateScript方法：根据genre+style_tag生成不同风格剧本
- 至少生成3个scenes，包含dialogues/actions/camera_suggestions
- 输出长度受length_level控制（short 500-800字，mid 800-1500字，long 1500-2500字）
- 支持中英文：lang=en时dialogues和描述为英文

#### 固化数据结构（用于工具联动）
- 定义EnhancedScriptContent类型（works.content for type=script）
- 包含：genre、lang、logline、world、characters[]、constraints、params、script_text、scenes[]、updated_from
- script_text：完整剧本文字（供编辑器展示和导出）
- scenes[]：结构化场景列表（供分镜生成器使用）
- updated_from.source_script_id：来源剧本ID（若从旧作品载入）

#### 工具联动入口
- "生成分镜"按钮：跳转到#/tools/storyboard
- 使用localStorage传递source_script_id（last_source_script_id）
- 分镜生成器可自动选中该剧本作为输入来源

### 优化 (Improved)

#### 类型定义增强
- 添加Character类型：name、traits、relation
- 添加ScriptParams类型：length_level、pace、temperature、style_tag
- 添加EnhancedScene类型：scene_no、location、summary、dialogues、actions、camera_suggestions
- Work类型支持EnhancedScriptContent

#### 用户体验优化
- 来源作品选择：下拉列表仅显示当前用户的剧本作品
- 角色管理：可视化增删改，每个角色独立卡片
- 生成状态：loading状态显示，错误提示友好
- 统计信息：显示场景数、角色数、字数

---

## [2.4.3] - 2026-01-19

### 优化 (Improved)

#### 布局优化
- 移除分镜生成器、镜头卡、剪辑合成三个页面的左侧面板
- 左侧面板仅显示页面名称，无实际功能，浪费空间
- 移除后内容区域更宽敞，用户体验更好

#### 技术改进
- ToolLayout组件：leftPanel参数改为可选（ReactNode → ReactNode?）
- 当leftPanel为null时，自动隐藏左侧面板容器
- 布局自动调整，中间和右侧面板占据更多空间

---

## [2.4.2] - 2026-01-19

### 优化 (Improved)

#### UI统一优化
- 统一分镜生成器、镜头卡、剪辑合成三个页面的UI样式
- 所有工具页面与剧本生成器保持一致的视觉风格
- 提升整体用户体验的连贯性和一致性

#### 间距优化
- 表单项间距：16px → 24px (+50%)
- 卡片内边距：16px → 24px (+50%)
- 卡片内部间距：12px → 16px (+33%)
- 列表项间距统一为24px

#### 标签样式优化
- 主标签：字体加粗、颜色强调、下边距12px
- 列表标题：字体加粗、颜色强调、字号增大
- 卡片内标签：字体加粗、颜色强调
- 统计信息：添加卡片容器、数值高亮显示

#### 输入框样式优化
- 背景色：灰色 → 白色
- 边框宽度：1px → 2px (+100%)
- 添加悬停效果：边框半透明主色
- 添加焦点效果：边框主色
- 添加过渡动画：颜色平滑过渡
- 单行输入框固定高度：44px
- 多行文本框行数增加：2-4行 → 3-6行

#### 按钮样式优化
- 主要操作按钮：高度增加到48px
- 渐变背景：三色渐变（紫-蓝-粉）
- 悬停效果：渐变色加深
- 字体加粗：font-semibold
- 阴影效果：shadow-lg + hover:shadow-xl
- 次要按钮：边框加粗、添加悬停效果

#### 卡片样式优化
- 内边距增加：16px → 24px
- 背景半透明：50%透明度
- 边框加粗：1px → 2px
- 层次更清晰、视觉更柔和

#### 右侧面板优化
- 添加统计信息卡片容器
- 数值高亮显示（主色+加粗）
- 统一布局和间距

### 文档 (Documentation)

#### 新增文档
- 创建 `UI_UNIFICATION.md`（10KB）：UI统一优化完整说明
- 包含：优化内容、对比表格、视觉效果提升、用户体验改善、技术实现、验收标准

---

## [2.4.1] - 2026-01-19

### 修复 (Fixed)

#### 后台管理导航问题
- 修复登录后导航栏不显示"后台管理"入口的问题
- 修复直接访问 `#/admin` 页面无法正常显示的问题
- 修复 useEffect 依赖项导致的无限循环问题

#### 技术修复
- MainLayout.tsx: 使用 `useMemo` 动态生成导航菜单，确保 currentUser 变化时正确更新
- Admin.tsx: 移除 useEffect 中的 navigate 和 toast 依赖，避免无限循环
- Admin.tsx: 添加未登录时的友好提示界面，替代强制跳转

#### 用户体验优化
- 未登录访问后台时显示清晰的提示卡片
- 提示卡片包含锁图标、说明文字和返回首页按钮
- 登录后导航栏自动显示后台管理入口
- 移动端菜单中也正确显示后台管理入口

### 文档 (Documentation)

#### 新增文档
- 创建 `ADMIN_TEST_GUIDE.md`（6.5KB）：后台管理功能完整测试指南
- 包含：10个测试场景、验收标准、常见问题排查、技术说明

---

## [2.4.0] - 2026-01-19

### 新增 (Added)

#### 后台管理系统
- 创建后台管理页面 (`/admin`)，提供系统配置中心
- 添加后台管理路由和导航入口（登录后可见）
- 实现权限控制：需要登录才能访问后台

#### API配置功能
- OpenAI API Key配置：支持输入和保存API密钥
- API Base URL配置：支持OpenAI官方、Azure OpenAI、本地部署等
- 模型名称配置：可自定义使用的AI模型
- AI生成开关：启用/禁用真实API生成，关闭时使用本地模拟
- 功能开关：独立控制剧本、分镜、镜头卡、剪辑计划生成功能
- API连接测试：测试配置的API是否可用

#### 系统设置功能
- 网站基本信息：网站名称、网站描述配置
- 用户限制：每用户最大作品数配置
- 功能开关：用户注册开关、邮箱验证开关
- 数据存储模式：本地存储(localStorage) / 远程API 切换
- 远程API地址配置：支持配置后端API地址

#### 数据管理功能
- 数据统计：实时显示用户数、作品数、新闻数、链接数
- 数据导出：导出所有数据为JSON文件（backup-{时间戳}.json）
- 数据清空：清空localStorage中的所有数据（需确认）

#### 配置持久化
- 所有配置保存到localStorage
- 配置键名：`admin_api_config`（API配置）、`admin_system_config`（系统设置）
- 页面加载时自动读取已保存的配置

#### UI组件
- 使用Tabs组件实现多标签页切换
- 使用Switch组件实现开关控制
- 使用Card组件展示配置区域
- 响应式设计：移动端和桌面端自适应

### 优化 (Improved)

#### 导航系统
- 导航栏动态显示：登录后显示"后台管理"入口
- 面包屑支持：添加后台管理页面的面包屑导航
- 移动端菜单：后台管理入口在移动端菜单中也可见

#### 国际化
- 添加后台管理相关的中英文翻译
- 中文：`admin: '后台管理'`
- 英文：`admin: 'Admin'`

### 文档 (Documentation)

#### 新增文档
- 创建 `ADMIN_GUIDE.md`（8.5KB）：后台管理系统完整使用指南
- 包含：功能说明、配置项、使用场景、安全说明、常见问题等

#### 更新文档
- 更新 `TODO.md`：添加v2.4后台管理系统清单
- 更新 `CHANGELOG.md`：记录v2.4所有变更

### 待开发 (Planned)

#### 用户管理功能
- 查看用户列表
- 编辑用户信息
- 管理用户权限
- 查看用户作品

#### 内容管理功能
- 批量管理新闻
- 批量管理友情链接
- 内容审核
- 内容统计

---

## [2.3.0] - 2026-01-19

### 优化 (Improved)

#### 间距优化
- 表单项间距：从 16px 增加到 24px (+50%)
- 标签和输入框间距：从 4px 增加到 12px (+200%)
- 左侧卡片内边距：从 16px 增加到 24px (+50%)
- 中间卡片内边距：从 24px 增加到 32px (+33%)
- 右侧卡片内边距：从 16px 增加到 24px (+50%)
- 卡片间距（移动端）：从 16px 增加到 24px (+50%)
- 卡片间距（桌面端）：从 24px 增加到 32px (+33%)
- 容器上下边距：从 24px 增加到 32px (+33%)
- 滑块间距：从 24px 增加到 32px (+33%)

#### 输入框优化
- 背景色：从灰色（bg-input）改为白色（bg-background）
- 边框宽度：从 1px 增加到 2px
- 悬停效果：添加边框颜色变化（hover:border-primary/50）
- 焦点效果：添加边框高亮（focus:border-primary）
- 过渡动画：添加平滑颜色过渡（transition-colors）
- 输入框高度：从 40px 增加到 44px (+10%)
- 文本域禁止调整大小：添加 resize-none

#### 标签优化
- 字体加粗：添加 font-semibold
- 文字颜色：明确使用 text-foreground
- 下边距：增加到 12px（mb-3）
- 块级显示：添加 block
- 辅助文字：使用柔和颜色（text-muted-foreground）和正常字重（font-normal）

#### 按钮优化
- 生成按钮高度：从 40px 增加到 48px (+20%)
- 生成按钮样式：使用三色渐变（from-primary via-secondary to-accent）
- 生成按钮字号：增加到 text-base
- 生成按钮字重：添加 font-semibold
- 生成按钮阴影：添加 shadow-lg
- 保存按钮高度：从 40px 增加到 44px (+10%)
- 保存按钮字重：添加 font-semibold
- 按钮图标尺寸：从 16px 增加到 20px (+25%)
- 悬停效果：透明度变化（hover:opacity-90）

#### 文本域优化
- 故事提示行数：从 3行 增加到 4行 (+33%)
- 世界观行数：从 2行 增加到 3行 (+50%)
- 剧本输入行数：从 15行 增加到 16行 (+7%)

#### 滑块标签优化
- 标签布局：使用 flex 布局，标签和数值分开显示
- 标签字重：添加 font-semibold
- 标签下边距：增加到 16px（mb-4）
- 数值样式：使用主色（text-primary）和加粗（font-bold）
- 视觉层次：标签和数值清晰分离

#### 面板宽度优化
- 左侧面板：从 192px（xl:w-48）增加到 224px（xl:w-56）(+17%)
- 右侧面板：从 288px（xl:w-72）增加到 320px（xl:w-80）(+11%)

#### 全局样式优化
- 添加输入框焦点光晕效果：`box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1)`
- 添加渐变按钮样式类：`.gradient-button`
- 添加滑块悬停放大效果：`transform: scale(1.1)`

### 修复 (Fixed)

#### 用户体验问题
- 修复UI过于紧凑的问题，增加所有间距
- 修复输入框层次不清的问题，改用白色背景
- 修复标签不够突出的问题，添加加粗和间距
- 修复按钮单调的问题，使用渐变效果
- 修复缺乏呼吸感的问题，全面增加间距

#### 视觉问题
- 修复灰色背景导致层次不清的问题
- 修复边框过细不够清晰的问题
- 修复焦点效果不明显的问题
- 修复按钮高度不足的问题
- 修复数值显示不够突出的问题

### 变更 (Changed)

#### 设计理念
- 从"紧凑高效"转向"舒适美观"
- 从"功能优先"转向"体验优先"
- 增加呼吸感和视觉层次
- 提升专业感和品质感

---

## [2.2.0] - 2026-01-19

### 优化 (Improved)

#### 配色方案优化
- 从深色主题改为浅色主题，减少视觉疲劳
- 背景色：深紫色 `hsl(270 50% 5%)` → 浅灰白色 `hsl(0 0% 98%)`
- 前景色：浅色 `hsl(280 20% 95%)` → 深灰色 `hsl(240 10% 15%)`
- 卡片背景：深紫色 `hsl(270 40% 10%)` → 纯白色 `hsl(0 0% 100%)`
- 主色饱和度：霓虹紫 80% → 优雅紫 70%
- 次要色饱和度：霓虹蓝 85% → 柔和蓝 75%
- 强调色饱和度：霓虹粉 85% → 活力粉 75%
- 边框颜色：深色 `hsl(270 40% 20%)` → 浅灰 `hsl(240 6% 90%)`
- 阴影效果：霓虹光晕 → 柔和阴影

#### 布局优化
- 移除 ToolLayout 中的所有 ScrollArea 组件
- 从多滚动条（4个）改为单滚动条（1个）
- 使用 Flex 布局替代 Grid 布局
- 左侧面板：固定宽度 `xl:w-48`，内容自适应
- 中间面板：弹性宽度 `flex-1`，自然流动
- 右侧面板：固定宽度 `xl:w-72`，Sticky 定位 `xl:sticky xl:top-24`
- 右侧面板始终可见，无需独立滚动

#### 滚动条优化
- 自定义滚动条样式：宽度 8px，圆角设计
- 滚动条轨道：使用 `--muted` 颜色
- 滚动条滑块：使用 `--muted-foreground` 颜色，透明度 0.3
- 滚动条悬停：透明度提升到 0.5

#### 字体和动画优化
- 添加字体渲染优化：`-webkit-font-smoothing: antialiased`
- 添加平滑滚动：`scroll-behavior: smooth`
- 优化卡片悬停效果：位移距离从 4px 减少到 2px
- 使用缓动函数：`cubic-bezier(0.4, 0, 0.2, 1)`

### 修复 (Fixed)

#### 用户体验问题
- 修复深色背景长时间观看造成视觉疲劳的问题
- 修复填写页面多个滚动条导致观感不佳的问题
- 修复滚动交互混乱，用户不知道应该滚动哪个区域的问题
- 修复高饱和度霓虹色分散注意力的问题

#### 代码质量
- 清理 index.css 中的重复代码
- 移除不必要的 ScrollArea 依赖
- 简化布局组件结构

### 变更 (Changed)

#### 设计风格转变
- 从"科技炫酷风"转向"专业优雅风"
- 从"展示演示型"转向"长时间工作型"
- 保留霓虹渐变作为品牌特色（标题、按钮、强调色）
- 移除过度的发光效果

#### 适用场景
- 更适合专业创作者长时间使用
- 在各种环境下都舒适（明亮/暗淡）
- 提高可读性和专业感

---

## [2.1.0] - 2026-01-19

### 修复 (Fixed)

#### PRD文档修正
- 修正路由写法：统一为 `#/news` 格式（之前错误写成 `/news`）
- 清理所有 `\n` 和断裂的 Markdown/JSON 格式错误
- 修正 Mock 数据中的 JSON 格式错误（移除注释、修复括号）
- 修正 i18n 示例代码块格式错误

#### 权限逻辑修正
- 修正权限规则：未登录用户不可查看作品列表（之前错误允许）
- 修正权限判断字段：`current_user.id === work.author_id`（之前错误写成 `users.author_id === works.author_id`）
- 明确 Studio 页面需要登录才能访问
- 明确工具页可访问但保存需登录

### 新增 (Added)

#### 数据模型增强
- Work 表添加 `content_text` 字段（编辑器原文）
- Work 表添加 `content_json` 字段（结构化数据）
- 所有表的 `updated_ms` 字段规范化

#### 功能规范补充
- 新增草稿自动保存规范（每5秒保存到 `draft:{tool}:{workId|new}`）
- 新增离开页面未保存提醒规范
- 新增列表排序规则（默认 `updated_ms` 倒序）
- 新增删除确认弹窗统一规范
- 新增导出功能规范（TXT/JSON）
- 新增快捷示例规范（提升演示效果）

#### i18n 规范明确
- 明确 UI 文案语言：跟随全局 `app_lang`
- 明确生成器输出语言：工具页选择 > 全局 `app_lang`
- 明确 works.lang 写入规则：保存时的语言
- 补充语言持久化 key：`app_lang`

#### Studio 功能明确
- 补充打开作品跳转规则：根据 type 跳转到对应工具页
- 补充保存逻辑：无 id 则 POST，有 id 则 PATCH
- 补充 URL 参数传递：`#/tools/script?id={workId}`

#### API 预留章节（新增第11章）
- 新增数据访问层抽象说明
- 新增远端 API 返回结构规范
- 新增完整的 REST API Endpoint 清单
  - 认证接口：register, login, logout
  - 用户接口：me
  - 作品接口：CRUD + 查询
  - 新闻接口：CRUD + 查询
  - 友情链接接口：CRUD
- 新增 AI 生成接口预留
  - 生成剧本
  - 生成分镜
  - 生成镜头卡
  - 生成剪辑计划
- 新增 Token/鉴权预留说明

### 变更 (Changed)

#### 统一 API 响应结构
- 成功响应：`{ ok: true, data: T }`
- 失败响应：`{ ok: false, error: { code, message } }`
- 补充错误码：401（未登录）、403（无权限）、409（冲突）、422（校验失败）

#### 文档结构优化
- 将 API 预留内容从分散章节整合到第11章
- 补充完整的请求/响应示例
- 明确原型阶段和 Remote 模式的区别

---

## [2.0.0] - 2026-01-19

### 新增 (Added)

#### 数据访问层抽象
- 新增 `DataClient` 接口，定义统一的数据访问方法
- 新增 `LocalTableClient` 类，实现基于 localStorage 的数据存储
- 新增 `dataClient` 工厂函数，支持存储模式切换
- 新增 `ApiResponse<T>` 统一响应结构
- 新增 `ErrorCode` 枚举，定义标准错误码
- 新增 `QueryOptions` 接口，支持过滤、搜索、排序、分页

#### 查询功能增强
- `query()` 方法支持 `filter` 参数（按字段过滤）
- `query()` 方法支持 `search` 参数（全文搜索）
- `query()` 方法支持 `sort` 和 `order` 参数（排序）
- `query()` 方法支持 `limit` 和 `offset` 参数（分页）

#### 数据模型增强
- 所有表添加 `updated_ms` 字段
- `post()` 方法自动添加 `created_ms` 和 `updated_ms`
- `patch()` 方法自动更新 `updated_ms`
- 表名白名单验证（只允许 users/works/news/links）

#### 文档
- 新增 `PRD.md` - 完整的产品需求文档（50+ 页）
- 新增 `ARCHITECTURE.md` - 架构说明文档（30+ 页）
- 新增 `UPGRADE_SUMMARY.md` - v2.0 升级总结
- 新增 `QUICKSTART.md` - 快速开始指南
- 新增 `API.md` - API 接口文档（为后端开发提供参考）
- 新增 `CHANGELOG.md` - 变更日志

### 变更 (Changed)

#### 数据模型
- `User` 类型添加 `updated_ms: number` 字段
- `News` 类型添加 `updated_ms: number` 字段
- `Link` 类型添加 `updated_ms: number` 字段
- 所有 mock 数据添加 `updated_ms` 字段

#### 数据访问
- `mockData.ts` 中的 `initMockData()` 改为使用 `localTableClient`
- `AuthContext.tsx` 中的注册功能添加 `updated_ms` 字段
- `News.tsx` 中的创建功能添加 `updated_ms` 字段
- `Links.tsx` 中的创建功能添加 `updated_ms` 字段

#### 类型安全
- `localTableClient.ts` 中的类型断言优化
- 修复所有 TypeScript 类型错误

### 修复 (Fixed)
- 修复 `localTableClient.ts` 中的 `unknown` 类型错误
- 修复 `AuthContext.tsx` 中缺少 `updated_ms` 的错误
- 修复 `News.tsx` 和 `Links.tsx` 中缺少 `updated_ms` 的错误

### 技术债务 (Technical Debt)
- 保留旧的 `tableApi.ts` 以保持向后兼容（未来版本将移除）

---

## [1.0.0] - 2026-01-18

### 新增 (Added)

#### 核心功能
- 完整的 Hash Router 路由系统（14个页面）
- 演示级登录注册系统
- 中英文国际化支持
- 霓虹渐变科技风格 UI
- 响应式布局（桌面/平板/手机）

#### 页面组件
- 首页 (Home) - 工具入口展示
- 行业动态 (News) - 新闻列表和详情
- 创作工坊 (Studio) - 作品管理中心
- 剧本生成器 (ScriptGenerator) - 本地模拟生成
- 分镜生成器 (StoryboardGenerator) - 分镜脚本生成
- 镜头卡 (VideoCards) - 镜头卡片管理
- 剪辑合成 (Editing) - 剪辑计划制定
- 友情链接 (Links) - 链接管理
- 会员方案 (Pricing) - 会员等级展示
- 关于我们 (About) - 静态页面
- 联系我们 (Contact) - 静态页面
- 隐私政策 (Privacy) - 静态页面
- 使用条款 (Terms) - 静态页面
- 404页面 (NotFound)

#### 布局组件
- `MainLayout` - 主布局（顶部导航+面包屑+底部）
- `ToolLayout` - 工具页布局（三栏布局）

#### 认证组件
- `LoginDialog` - 登录对话框
- `RegisterDialog` - 注册对话框
- `AuthContext` - 认证状态管理

#### 通用组件
- `ToolCard` - 工具入口卡片
- `WorkCard` - 作品卡片
- `NewsCard` - 新闻卡片
- `LinkCard` - 友情链接卡片

#### 核心库
- `tableApi.ts` - localStorage CRUD 封装
- `i18n.ts` - 国际化配置（100+ 键）
- `mockData.ts` - 模拟数据
- `utils.ts` - 工具函数

#### 上下文
- `AuthContext` - 认证状态管理
- `LanguageContext` - 语言状态管理

#### 类型定义
- `types.ts` - 完整的数据模型定义
  - User, Work, News, Link
  - ScriptContent, StoryboardContent, VideoCardsContent, EditPlanContent
  - CurrentUser, TableName

#### 设计系统
- CSS 变量定义（霓虹渐变主题）
- Tailwind 配置（语义化颜色）
- 渐变文字工具类
- 发光效果工具类

#### 依赖
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- date-fns

### 技术特性
- 纯前端应用，无需后端
- localStorage 数据持久化
- Hash Router 单页应用
- 响应式设计
- 类型安全（TypeScript）
- 代码规范（ESLint + Biome）

---

## [未来计划]

### v2.1.0 (计划中)
- [ ] 搜索筛选 UI 组件
- [ ] 导出功能（TXT/JSON）
- [ ] 草稿自动保存
- [ ] 离开页面未保存提醒
- [ ] 完整的权限拦截中间件
- [ ] 邮箱唯一性验证增强
- [ ] 密码规则验证增强

### v3.0.0 (计划中)
- [ ] RemoteApiClient 实现
- [ ] 真实后端 API 集成
- [ ] JWT Token 认证
- [ ] 真实 AI 生成接口
- [ ] 团队协作功能
- [ ] 版本历史
- [ ] 评论系统

### v4.0.0 (计划中)
- [ ] 素材上传功能
- [ ] 图片/视频管理
- [ ] 实时协作编辑
- [ ] WebSocket 支持
- [ ] PDF/Word 导出
- [ ] 移动端 App

---

## 版本说明

### 版本号格式
`主版本号.次版本号.修订号`

- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

### 变更类型
- **新增 (Added)**：新功能
- **变更 (Changed)**：现有功能的变更
- **弃用 (Deprecated)**：即将移除的功能
- **移除 (Removed)**：已移除的功能
- **修复 (Fixed)**：Bug 修复
- **安全 (Security)**：安全相关的修复

---

**维护者**：AICM Workshop Team  
**最后更新**：2026-01-19
