// Mock生成器 - 本地模拟AI生成剧本

import type { GenerateScriptPayload, ScriptGenerationResult } from './aiClient';

/**
 * Mock生成剧本
 * @param payload 生成参数
 * @returns 剧本生成结果
 */
export async function mockGenerateScript(
  payload: GenerateScriptPayload
): Promise<ScriptGenerationResult> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 2000));

  const { lang, genre, input, params } = payload;
  const { logline, world, characters } = input;
  const { length_level, style_tag } = params;

  // 根据语言选择文案
  const isZh = lang === 'zh';

  // 根据题材和风格生成不同的场景数量
  const sceneCount = length_level === 'short' ? 3 : length_level === 'mid' ? 5 : 8;

  // 生成场景
  const scenes: Array<{
    scene_no: number;
    location: string;
    summary: string;
    dialogues: Array<{
      speaker: string;
      line: string;
    }>;
    actions: string[];
    camera_suggestions: string;
  }> = [];
  for (let i = 0; i < sceneCount; i++) {
    const sceneNo = i + 1;
    const location = generateLocation(genre, sceneNo, isZh);
    const summary = generateSummary(genre, sceneNo, logline, isZh);
    const dialogues = generateDialogues(characters, sceneNo, genre, isZh);
    const actions = generateActions(genre, sceneNo, isZh);
    const cameraSuggestions = generateCameraSuggestions(genre, sceneNo, isZh);

    scenes.push({
      scene_no: sceneNo,
      location,
      summary,
      dialogues,
      actions,
      camera_suggestions: cameraSuggestions
    });
  }

  // 生成完整剧本文字
  const scriptText = generateScriptText(
    logline,
    world,
    characters,
    scenes,
    genre,
    style_tag,
    isZh
  );

  return {
    script_text: scriptText,
    scenes
  };
}

/**
 * 根据题材生成场景地点
 */
function generateLocation(genre: string, sceneNo: number, isZh: boolean): string {
  const locations: Record<string, string[]> = {
    romance: isZh
      ? ['咖啡厅', '校园操场', '图书馆', '海边', '公园', '电影院', '家中客厅', '天台']
      : ['Cafe', 'School Playground', 'Library', 'Beach', 'Park', 'Cinema', 'Living Room', 'Rooftop'],
    scifi: isZh
      ? ['太空站', '实验室', '控制中心', '飞船驾驶舱', '地下基地', '虚拟空间', '废墟', '未来城市']
      : ['Space Station', 'Laboratory', 'Control Center', 'Spaceship Cockpit', 'Underground Base', 'Virtual Space', 'Ruins', 'Future City'],
    mystery: isZh
      ? ['案发现场', '警察局', '废弃工厂', '密室', '图书馆', '老宅', '地下室', '档案室']
      : ['Crime Scene', 'Police Station', 'Abandoned Factory', 'Secret Room', 'Library', 'Old Mansion', 'Basement', 'Archive Room'],
    campus: isZh
      ? ['教室', '操场', '食堂', '图书馆', '社团活动室', '校门口', '宿舍', '体育馆']
      : ['Classroom', 'Playground', 'Cafeteria', 'Library', 'Club Room', 'School Gate', 'Dormitory', 'Gymnasium'],
    family: isZh
      ? ['家中客厅', '厨房', '卧室', '餐厅', '阳台', '花园', '车库', '书房']
      : ['Living Room', 'Kitchen', 'Bedroom', 'Dining Room', 'Balcony', 'Garden', 'Garage', 'Study'],
    thriller: isZh
      ? ['黑暗小巷', '废弃医院', '森林深处', '地下停车场', '老旧公寓', '荒废游乐园', '隧道', '仓库']
      : ['Dark Alley', 'Abandoned Hospital', 'Deep Forest', 'Underground Parking', 'Old Apartment', 'Abandoned Amusement Park', 'Tunnel', 'Warehouse']
  };

  const genreLocations = locations[genre] || locations.campus;
  return genreLocations[(sceneNo - 1) % genreLocations.length];
}

/**
 * 生成场景摘要
 */
function generateSummary(genre: string, sceneNo: number, logline: string, isZh: boolean): string {
  if (isZh) {
    const templates = [
      `第${sceneNo}场：故事开始，${logline}的序幕拉开`,
      `第${sceneNo}场：主角面临新的挑战`,
      `第${sceneNo}场：关键转折点，情节急转直下`,
      `第${sceneNo}场：矛盾冲突升级`,
      `第${sceneNo}场：真相逐渐浮出水面`,
      `第${sceneNo}场：高潮部分，紧张刺激`,
      `第${sceneNo}场：情感爆发，人物关系变化`,
      `第${sceneNo}场：故事收尾，留下悬念`
    ];
    return templates[(sceneNo - 1) % templates.length];
  } else {
    const templates = [
      `Scene ${sceneNo}: The story begins, ${logline}`,
      `Scene ${sceneNo}: The protagonist faces a new challenge`,
      `Scene ${sceneNo}: A critical turning point`,
      `Scene ${sceneNo}: Conflict escalates`,
      `Scene ${sceneNo}: The truth gradually emerges`,
      `Scene ${sceneNo}: Climax, intense and thrilling`,
      `Scene ${sceneNo}: Emotional outburst, relationship changes`,
      `Scene ${sceneNo}: Story conclusion, leaving suspense`
    ];
    return templates[(sceneNo - 1) % templates.length];
  }
}

/**
 * 生成对话
 */
function generateDialogues(
  characters: Array<{ name: string; traits: string; relation: string }>,
  sceneNo: number,
  genre: string,
  isZh: boolean
): Array<{ speaker: string; line: string }> {
  if (characters.length === 0) {
    return [];
  }

  const dialogues: Array<{ speaker: string; line: string }> = [];
  const charCount = Math.min(characters.length, 3);

  for (let i = 0; i < charCount; i++) {
    const char = characters[i % characters.length];
    const line = generateDialogueLine(char, sceneNo, genre, isZh);
    dialogues.push({
      speaker: char.name,
      line
    });
  }

  return dialogues;
}

/**
 * 生成单句对话
 */
function generateDialogueLine(
  character: { name: string; traits: string; relation: string },
  sceneNo: number,
  genre: string,
  isZh: boolean
): string {
  if (isZh) {
    const templates = [
      `${character.name}：这件事情没有那么简单...`,
      `${character.name}：我们必须马上行动！`,
      `${character.name}：你真的确定要这么做吗？`,
      `${character.name}：我一直在等这一刻。`,
      `${character.name}：事情的真相远比我们想象的复杂。`,
      `${character.name}：相信我，我不会让你失望的。`,
      `${character.name}：这是我们唯一的机会了。`,
      `${character.name}：我早就知道会是这样的结果。`
    ];
    return templates[(sceneNo - 1) % templates.length];
  } else {
    const templates = [
      `${character.name}: This is not as simple as it seems...`,
      `${character.name}: We must act now!`,
      `${character.name}: Are you sure you want to do this?`,
      `${character.name}: I've been waiting for this moment.`,
      `${character.name}: The truth is far more complex than we thought.`,
      `${character.name}: Trust me, I won't let you down.`,
      `${character.name}: This is our only chance.`,
      `${character.name}: I knew it would turn out this way.`
    ];
    return templates[(sceneNo - 1) % templates.length];
  }
}

/**
 * 生成动作描述
 */
function generateActions(genre: string, sceneNo: number, isZh: boolean): string[] {
  if (isZh) {
    const actions = [
      '主角缓缓走进房间，环顾四周',
      '突然，一阵急促的脚步声传来',
      '角色之间对视，气氛紧张',
      '主角拿起桌上的物品，仔细端详',
      '背景音乐渐强，镜头推进',
      '角色转身离开，留下一个背影',
      '灯光突然熄灭，一片漆黑',
      '主角做出决定，眼神坚定'
    ];
    return [actions[(sceneNo - 1) % actions.length]];
  } else {
    const actions = [
      'The protagonist slowly enters the room, looking around',
      'Suddenly, rapid footsteps are heard',
      'Characters make eye contact, tension builds',
      'The protagonist picks up an object from the table, examining it carefully',
      'Background music intensifies, camera pushes in',
      'Character turns and leaves, showing their back',
      'Lights suddenly go out, complete darkness',
      'Protagonist makes a decision, eyes determined'
    ];
    return [actions[(sceneNo - 1) % actions.length]];
  }
}

/**
 * 生成镜头建议
 */
function generateCameraSuggestions(genre: string, sceneNo: number, isZh: boolean): string {
  if (isZh) {
    const suggestions = [
      '中景，平视角度，展现人物关系',
      '特写，捕捉人物表情变化',
      '全景，展示环境氛围',
      '跟拍，跟随人物移动',
      '俯拍，营造压迫感',
      '仰拍，突出人物气势',
      '推镜头，聚焦关键物品',
      '拉镜头，展现全局'
    ];
    return suggestions[(sceneNo - 1) % suggestions.length];
  } else {
    const suggestions = [
      'Medium shot, eye-level angle, showing character relationships',
      'Close-up, capturing facial expressions',
      'Wide shot, establishing environment',
      'Tracking shot, following character movement',
      'High angle, creating oppression',
      'Low angle, emphasizing character presence',
      'Push in, focusing on key object',
      'Pull out, revealing the big picture'
    ];
    return suggestions[(sceneNo - 1) % suggestions.length];
  }
}

/**
 * 生成完整剧本文字
 */
function generateScriptText(
  logline: string,
  world: string,
  characters: Array<{ name: string; traits: string; relation: string }>,
  scenes: Array<{
    scene_no: number;
    location: string;
    summary: string;
    dialogues: Array<{ speaker: string; line: string }>;
    actions: string[];
    camera_suggestions: string;
  }>,
  genre: string,
  styleTag: string,
  isZh: boolean
): string {
  let script = '';

  // 标题和概述
  if (isZh) {
    script += `【剧本标题】${genre}题材 - ${styleTag}风格\n\n`;
    script += `【故事概述】\n${logline}\n\n`;
    script += `【世界观设定】\n${world}\n\n`;
    script += `【主要角色】\n`;
    characters.forEach(char => {
      script += `- ${char.name}：${char.traits}（${char.relation}）\n`;
    });
    script += '\n';
    script += '=' .repeat(50) + '\n\n';
  } else {
    script += `[Script Title] ${genre} Genre - ${styleTag} Style\n\n`;
    script += `[Story Overview]\n${logline}\n\n`;
    script += `[World Setting]\n${world}\n\n`;
    script += `[Main Characters]\n`;
    characters.forEach(char => {
      script += `- ${char.name}: ${char.traits} (${char.relation})\n`;
    });
    script += '\n';
    script += '='.repeat(50) + '\n\n';
  }

  // 场景详情
  scenes.forEach(scene => {
    if (isZh) {
      script += `【第${scene.scene_no}场】${scene.location}\n\n`;
      script += `场景摘要：${scene.summary}\n\n`;
      script += `镜头建议：${scene.camera_suggestions}\n\n`;
      script += `动作描述：\n`;
      scene.actions.forEach(action => {
        script += `  ${action}\n`;
      });
      script += '\n';
      if (scene.dialogues.length > 0) {
        script += `对白：\n`;
        scene.dialogues.forEach(dialogue => {
          script += `  ${dialogue.speaker}："${dialogue.line}"\n`;
        });
        script += '\n';
      }
      script += '-'.repeat(50) + '\n\n';
    } else {
      script += `[Scene ${scene.scene_no}] ${scene.location}\n\n`;
      script += `Summary: ${scene.summary}\n\n`;
      script += `Camera: ${scene.camera_suggestions}\n\n`;
      script += `Actions:\n`;
      scene.actions.forEach(action => {
        script += `  ${action}\n`;
      });
      script += '\n';
      if (scene.dialogues.length > 0) {
        script += `Dialogues:\n`;
        scene.dialogues.forEach(dialogue => {
          script += `  ${dialogue.speaker}: "${dialogue.line}"\n`;
        });
        script += '\n';
      }
      script += '-'.repeat(50) + '\n\n';
    }
  });

  // 结尾
  if (isZh) {
    script += '\n【全剧终】\n';
  } else {
    script += '\n[The End]\n';
  }

  return script;
}

/**
 * Mock生成分镜
 * @param payload 生成参数
 * @returns 分镜生成结果
 */
export async function mockGenerateStoryboard(
  payload: any
): Promise<any> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 2000));

  const { lang, genre, source, params } = payload;
  const { shot_density, visual_style, camera_variety, max_shots } = params;
  const isZh = lang === 'zh';

  // 根据shot_density确定每个scene生成多少个shots
  const shotsPerScene = shot_density === 'sparse' ? 3 : shot_density === 'dense' ? 6 : 4;

  const shots: Array<{
    shot_no: number;
    scene_ref: number;
    frame: string;
    action: string;
    camera: string;
    dialogue: string;
    duration_sec: number;
    notes: string;
  }> = [];

  // 如果有结构化scenes，按scenes生成
  if (source.scenes && source.scenes.length > 0) {
    let shotNo = 1;
    
    for (const scene of source.scenes) {
      const sceneShotsCount = Math.min(shotsPerScene, max_shots - shots.length);
      if (sceneShotsCount <= 0) break;

      for (let i = 0; i < sceneShotsCount; i++) {
        const frame = generateFrame(scene, i, genre, visual_style, isZh);
        const action = generateAction(scene, i, isZh);
        const camera = generateCamera(i, camera_variety, isZh);
        const dialogue = generateDialogue(scene, i, isZh);
        const duration = Math.floor(Math.random() * 3) + 3; // 3-6秒

        shots.push({
          shot_no: shotNo++,
          scene_ref: scene.scene_no,
          frame,
          action,
          camera,
          dialogue,
          duration_sec: duration,
          notes: ''
        });

        if (shots.length >= max_shots) break;
      }

      if (shots.length >= max_shots) break;
    }
  } else {
    // 如果没有结构化scenes，生成默认分镜
    const defaultShotsCount = Math.min(max_shots, 10);
    for (let i = 0; i < defaultShotsCount; i++) {
      shots.push({
        shot_no: i + 1,
        scene_ref: Math.floor(i / shotsPerScene) + 1,
        frame: isZh ? `画面${i + 1}：场景描述` : `Frame ${i + 1}: Scene description`,
        action: isZh ? '角色动作描述' : 'Character action',
        camera: generateCamera(i, camera_variety, isZh),
        dialogue: isZh ? '对白内容' : 'Dialogue content',
        duration_sec: 4,
        notes: ''
      });
    }
  }

  return { shots };
}

/**
 * 生成画面描述
 */
function generateFrame(
  scene: any,
  shotIndex: number,
  genre: string,
  visualStyle: string,
  isZh: boolean
): string {
  if (isZh) {
    const templates = [
      `${scene.location}，${scene.summary}`,
      `特写：${scene.location}的细节`,
      `全景：展现${scene.location}的整体环境`,
      `${scene.location}，气氛${genre === 'thriller' ? '紧张' : genre === 'romance' ? '温馨' : '平静'}`,
      `镜头聚焦在${scene.location}的关键物品上`
    ];
    return templates[shotIndex % templates.length];
  } else {
    const templates = [
      `${scene.location}, ${scene.summary}`,
      `Close-up: Details of ${scene.location}`,
      `Wide shot: Overall environment of ${scene.location}`,
      `${scene.location}, atmosphere is ${genre === 'thriller' ? 'tense' : genre === 'romance' ? 'warm' : 'calm'}`,
      `Focus on key objects in ${scene.location}`
    ];
    return templates[shotIndex % templates.length];
  }
}

/**
 * 生成动作描述
 */
function generateAction(scene: any, shotIndex: number, isZh: boolean): string {
  if (scene.actions && scene.actions.length > 0) {
    return scene.actions[shotIndex % scene.actions.length];
  }

  if (isZh) {
    const templates = [
      '角色缓缓走进画面',
      '角色停下脚步，环顾四周',
      '角色拿起物品，仔细端详',
      '角色转身离开',
      '角色与另一角色对视'
    ];
    return templates[shotIndex % templates.length];
  } else {
    const templates = [
      'Character slowly enters the frame',
      'Character stops and looks around',
      'Character picks up an object and examines it',
      'Character turns and leaves',
      'Character makes eye contact with another'
    ];
    return templates[shotIndex % templates.length];
  }
}

/**
 * 生成镜头机位
 */
function generateCamera(shotIndex: number, variety: string, isZh: boolean): string {
  if (isZh) {
    const low = ['中景', '近景', '中景', '近景'];
    const mid = ['全景', '中景', '近景', '特写', '跟拍', '推镜头', '拉镜头', '摇镜头'];
    const high = [
      '全景',
      '中景',
      '近景',
      '特写',
      '跟拍',
      '推镜头',
      '拉镜头',
      '摇镜头',
      '俯拍',
      '仰拍',
      '手持抖动',
      '长镜头',
      '景深变化',
      '斯坦尼康',
      '航拍'
    ];

    const cameras = variety === 'low' ? low : variety === 'high' ? high : mid;
    return cameras[shotIndex % cameras.length];
  } else {
    const low = ['Medium shot', 'Close-up', 'Medium shot', 'Close-up'];
    const mid = [
      'Wide shot',
      'Medium shot',
      'Close-up',
      'Extreme close-up',
      'Tracking shot',
      'Push in',
      'Pull out',
      'Pan'
    ];
    const high = [
      'Wide shot',
      'Medium shot',
      'Close-up',
      'Extreme close-up',
      'Tracking shot',
      'Push in',
      'Pull out',
      'Pan',
      'High angle',
      'Low angle',
      'Handheld',
      'Long take',
      'Depth of field change',
      'Steadicam',
      'Aerial shot'
    ];

    const cameras = variety === 'low' ? low : variety === 'high' ? high : mid;
    return cameras[shotIndex % cameras.length];
  }
}

/**
 * 生成对白
 */
function generateDialogue(scene: any, shotIndex: number, isZh: boolean): string {
  if (scene.dialogues && scene.dialogues.length > 0) {
    const dialogue = scene.dialogues[shotIndex % scene.dialogues.length];
    return `${dialogue.speaker}：${dialogue.line}`;
  }

  if (isZh) {
    return shotIndex % 3 === 0 ? '（无对白）' : '角色对白内容';
  } else {
    return shotIndex % 3 === 0 ? '(No dialogue)' : 'Character dialogue';
  }
}

/**
 * Mock生成镜头卡
 * @param payload 生成参数
 * @returns 镜头卡生成结果
 */
export async function mockGenerateVideoCards(
  payload: any
): Promise<any> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 2000));

  const { lang, genre, source, params } = payload;
  const { render_style, character_consistency, detail_level, camera_emphasis } = params;
  const isZh = lang === 'zh';

  const cards: Array<{
    card_no: number;
    shot_ref: number;
    visual_desc: string;
    character_action: string;
    lighting_mood: string;
    camera_desc: string;
    dialogue_voiceover: string;
    prompt: string;
    negative_prompt: string;
    notes: string;
  }> = [];

  // 从shots生成cards（一一对应）
  if (source.shots && source.shots.length > 0) {
    for (let i = 0; i < source.shots.length; i++) {
      const shot = source.shots[i];
      
      // 拆解shot的信息到card的各个字段
      const visual_desc = extractVisualDesc(shot.frame, isZh);
      const character_action = extractCharacterAction(shot.action, isZh);
      const lighting_mood = generateLightingMood(genre, i, isZh);
      const camera_desc = shot.camera || (isZh ? '中景' : 'Medium shot');
      const dialogue_voiceover = shot.dialogue || (isZh ? '（无对白）' : '(No dialogue)');

      // 生成prompt
      const prompt = buildPrompt({
        render_style,
        visual_desc,
        character_action,
        lighting_mood,
        camera_desc,
        genre,
        character_consistency,
        detail_level,
        camera_emphasis,
        isZh
      });

      cards.push({
        card_no: i + 1,
        shot_ref: shot.shot_no,
        visual_desc,
        character_action,
        lighting_mood,
        camera_desc,
        dialogue_voiceover,
        prompt,
        negative_prompt: '',
        notes: ''
      });
    }
  }

  return { cards };
}

/**
 * 提取画面描述
 */
function extractVisualDesc(frame: string, isZh: boolean): string {
  if (frame && frame.trim()) {
    return frame;
  }
  return isZh ? '场景画面描述' : 'Scene visual description';
}

/**
 * 提取角色动作
 */
function extractCharacterAction(action: string, isZh: boolean): string {
  if (action && action.trim()) {
    return action;
  }
  return isZh ? '角色动作描述' : 'Character action description';
}

/**
 * 生成光影氛围
 */
function generateLightingMood(genre: string, index: number, isZh: boolean): string {
  if (isZh) {
    const moodMap: Record<string, string[]> = {
      romance: ['柔和暖光', '温馨氛围', '浪漫光影', '柔焦效果'],
      scifi: ['冷色调科技感', '强烈对比', '霓虹光效', '未来感光影'],
      mystery: ['阴影重重', '冷色调', '强对比明暗', '悬疑氛围'],
      thriller: ['黑暗压抑', '强烈阴影', '冷峻色调', '紧张氛围'],
      campus: ['明亮清新', '自然光', '青春活力', '温暖色调'],
      family: ['温馨柔和', '自然光线', '温暖氛围', '舒适感']
    };
    const moods = moodMap[genre] || ['自然光线', '平衡氛围'];
    return moods[index % moods.length];
  } else {
    const moodMap: Record<string, string[]> = {
      romance: ['soft warm lighting', 'cozy atmosphere', 'romantic lighting', 'soft focus'],
      scifi: ['cold tech lighting', 'strong contrast', 'neon effects', 'futuristic lighting'],
      mystery: ['heavy shadows', 'cold tones', 'strong contrast', 'mysterious atmosphere'],
      thriller: ['dark oppressive', 'strong shadows', 'cold tones', 'tense atmosphere'],
      campus: ['bright fresh', 'natural light', 'youthful energy', 'warm tones'],
      family: ['warm cozy', 'natural lighting', 'warm atmosphere', 'comfortable feel']
    };
    const moods = moodMap[genre] || ['natural lighting', 'balanced atmosphere'];
    return moods[index % moods.length];
  }
}

/**
 * 构建Prompt（核心逻辑）
 */
function buildPrompt(options: {
  render_style: string;
  visual_desc: string;
  character_action: string;
  lighting_mood: string;
  camera_desc: string;
  genre: string;
  character_consistency: string;
  detail_level: string;
  camera_emphasis: string;
  isZh: boolean;
}): string {
  const {
    render_style,
    visual_desc,
    character_action,
    lighting_mood,
    camera_desc,
    genre,
    character_consistency,
    detail_level,
    camera_emphasis,
    isZh
  } = options;

  const parts: string[] = [];

  // 1. 渲染风格
  parts.push(render_style);

  // 2. 画面描述
  parts.push(visual_desc);

  // 3. 角色动作
  if (character_action && character_action !== '（无）' && character_action !== '(None)') {
    parts.push(character_action);
  }

  // 4. 光影氛围
  parts.push(lighting_mood);

  // 5. 机位描述（根据camera_emphasis决定是否强调）
  if (camera_emphasis === 'strong' || camera_emphasis === 'mid') {
    parts.push(camera_desc);
  }

  // 6. 情绪氛围（根据题材推断）
  const emotion = inferEmotion(genre, isZh);
  if (emotion) {
    parts.push(emotion);
  }

  // 7. 通用质量词
  if (isZh) {
    parts.push('高质量');
    parts.push('电影级构图');
  } else {
    parts.push('high quality');
    parts.push('cinematic composition');
  }

  // 8. 角色一致性提示
  if (character_consistency === 'high') {
    if (isZh) {
      parts.push('角色形象高度一致');
    } else {
      parts.push('consistent character design');
      parts.push('same character appearance');
    }
  }

  // 9. 细节级别提示
  if (detail_level === 'high') {
    if (isZh) {
      parts.push('细节丰富');
      parts.push('精致画面');
    } else {
      parts.push('highly detailed');
      parts.push('intricate details');
    }
  } else if (detail_level === 'mid') {
    if (isZh) {
      parts.push('适度细节');
    } else {
      parts.push('moderate detail');
    }
  }

  // 拼接
  if (isZh) {
    return parts.join('，');
  } else {
    return parts.join(', ');
  }
}

/**
 * 根据题材推断情绪氛围
 */
function inferEmotion(genre: string, isZh: boolean): string {
  if (isZh) {
    const emotionMap: Record<string, string> = {
      romance: '浪漫温馨氛围',
      scifi: '科幻未来感',
      mystery: '紧张悬疑氛围',
      thriller: '惊悚紧张氛围',
      campus: '青春活力氛围',
      family: '温馨家庭氛围'
    };
    return emotionMap[genre] || '平衡氛围';
  } else {
    const emotionMap: Record<string, string> = {
      romance: 'romantic warm atmosphere',
      scifi: 'sci-fi futuristic feel',
      mystery: 'tense mysterious atmosphere',
      thriller: 'thrilling tense atmosphere',
      campus: 'youthful energetic atmosphere',
      family: 'warm family atmosphere'
    };
    return emotionMap[genre] || 'balanced atmosphere';
  }
}

/**
 * Mock生成剪辑计划
 * @param payload 生成参数
 * @returns 剪辑计划生成结果
 */
export async function mockGenerateEditPlan(
  payload: any
): Promise<any> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 2000));

  const { lang, genre, source, params } = payload;
  const { pace, target_total_sec, transition_style, audio_style, subtitle_density } = params;
  const isZh = lang === 'zh';

  const items: Array<{
    item_no: number;
    shot_ref: number;
    source_prompt_ref: number;
    asset_need: string;
    voice_sfx: string;
    transition: string;
    duration_sec: number;
    caption_subtitle: string;
    notes: string;
  }> = [];

  // 从cards生成items（一一对应）
  if (source.cards && source.cards.length > 0) {
    // 第一步：计算每条的原始时长
    const rawDurations = source.cards.map((card: any) => {
      return calculateRawDuration(card, pace, isZh);
    });

    // 第二步：按比例缩放到target_total_sec
    const totalRaw = rawDurations.reduce((sum: number, d: number) => sum + d, 0);
    const scale = target_total_sec / totalRaw;
    let durations = rawDurations.map((d: number) => {
      return Math.max(1, Math.min(8, Math.round(d * scale)));
    });

    // 第三步：修正误差
    let totalDuration = durations.reduce((sum: number, d: number) => sum + d, 0);
    let diff = target_total_sec - totalDuration;
    let index = 0;
    while (diff !== 0 && index < durations.length) {
      if (diff > 0) {
        if (durations[index] < 8) {
          durations[index]++;
          diff--;
        }
      } else {
        if (durations[index] > 1) {
          durations[index]--;
          diff++;
        }
      }
      index++;
      if (index >= durations.length) index = 0;
      // 防止死循环
      if (Math.abs(diff) > durations.length * 2) break;
    }

    // 第四步：生成items
    for (let i = 0; i < source.cards.length; i++) {
      const card = source.cards[i];
      
      // 生成asset_need
      const asset_need = generateAssetNeed(card, isZh);

      // 生成voice_sfx
      const voice_sfx = generateVoiceSfx(card, audio_style, isZh);

      // 生成transition
      const transition = generateTransition(card, transition_style, i, source.cards.length, isZh);

      // 生成caption_subtitle
      const caption_subtitle = generateCaptionSubtitle(card, subtitle_density, isZh);

      items.push({
        item_no: i + 1,
        shot_ref: card.shot_ref || (i + 1),
        source_prompt_ref: card.card_no || (i + 1),
        asset_need,
        voice_sfx,
        transition,
        duration_sec: durations[i],
        caption_subtitle,
        notes: ''
      });
    }
  }

  return { items };
}

/**
 * 计算原始时长（根据pace和内容关键词）
 */
function calculateRawDuration(card: any, pace: string, isZh: boolean): number {
  // 基础时长
  let base = 2.5;
  if (pace === 'slow') base = 3.5;
  else if (pace === 'fast') base = 1.8;

  // 根据内容关键词加权
  const content = `${card.visual_desc} ${card.character_action} ${card.lighting_mood} ${card.camera_desc}`.toLowerCase();
  
  // 动作关键词
  const actionKeywords = isZh
    ? ['打斗', '爆炸', '追逐', '冲突', '战斗', '奔跑', '逃跑']
    : ['fight', 'explosion', 'chase', 'conflict', 'battle', 'run', 'escape'];
  
  // 情绪关键词
  const emotionKeywords = isZh
    ? ['情绪', '沉默', '凝视', '回忆', '思考', '哭泣', '微笑']
    : ['emotion', 'silence', 'gaze', 'memory', 'think', 'cry', 'smile'];
  
  // 转场关键词
  const transitionKeywords = isZh
    ? ['转场', '闪回', '蒙太奇', '切换', '过渡']
    : ['transition', 'flashback', 'montage', 'switch', 'fade'];

  let bonus = 0;
  
  // 检查动作关键词
  if (actionKeywords.some(kw => content.includes(kw))) {
    bonus += 0.6;
  }
  
  // 检查情绪关键词
  if (emotionKeywords.some(kw => content.includes(kw))) {
    bonus += pace === 'slow' ? 0.6 : 0.4;
  }
  
  // 检查转场关键词
  if (transitionKeywords.some(kw => content.includes(kw))) {
    bonus += 0.3;
  }

  return base + bonus;
}

/**
 * 生成素材需求
 */
function generateAssetNeed(card: any, isZh: boolean): string {
  const parts: string[] = [];
  
  if (card.visual_desc && card.visual_desc.trim()) {
    parts.push(card.visual_desc.trim());
  }
  
  if (card.character_action && card.character_action.trim() && card.character_action !== '（无）' && card.character_action !== '(None)') {
    parts.push(card.character_action.trim());
  }
  
  if (card.lighting_mood && card.lighting_mood.trim()) {
    parts.push(card.lighting_mood.trim());
  }

  if (parts.length === 0) {
    return isZh ? '基础场景素材' : 'Basic scene assets';
  }

  return isZh ? parts.join('；') : parts.join('; ');
}

/**
 * 生成配音/音效
 */
function generateVoiceSfx(card: any, audio_style: string, isZh: boolean): string {
  const parts: string[] = [];

  // 处理对白/旁白
  if (card.dialogue_voiceover && card.dialogue_voiceover.trim() && card.dialogue_voiceover !== '（无对白）' && card.dialogue_voiceover !== '(No dialogue)') {
    const dialogue = card.dialogue_voiceover.trim();
    if (isZh) {
      if (dialogue.includes('旁白') || dialogue.includes('：')) {
        parts.push(dialogue);
      } else {
        parts.push(`对白：${dialogue}`);
      }
    } else {
      if (dialogue.includes('Narration') || dialogue.includes(':')) {
        parts.push(dialogue);
      } else {
        parts.push(`Dialogue: ${dialogue}`);
      }
    }
  }

  // 生成环境音（根据audio_style）
  if (audio_style === 'rich' || audio_style === 'dramatic') {
    const ambience = generateAmbience(card, isZh);
    if (ambience) {
      parts.push(ambience);
    }
  }

  if (parts.length === 0) {
    return isZh ? '（无音效）' : '(No audio)';
  }

  return isZh ? parts.join('；') : parts.join('; ');
}

/**
 * 生成环境音
 */
function generateAmbience(card: any, isZh: boolean): string {
  const content = `${card.visual_desc} ${card.lighting_mood}`.toLowerCase();

  if (isZh) {
    const ambienceMap: Record<string, string[]> = {
      night: ['环境声：夜风', '环境声：虫鸣', '环境声：远处车流'],
      street: ['环境声：人群嘈杂', '环境声：车流', '环境声：脚步声'],
      rain: ['环境声：雨声', '环境声：雷声', '环境声：水滴'],
      indoor: ['环境声：空调', '环境声：脚步回声', '环境声：门响'],
      tech: ['环境声：电流', '环境声：机械运转', '环境声：电子音'],
      nature: ['环境声：鸟鸣', '环境声：风声', '环境声：流水']
    };

    for (const [key, sounds] of Object.entries(ambienceMap)) {
      if (content.includes(key) || content.includes(key === 'night' ? '夜' : key === 'street' ? '街' : key === 'rain' ? '雨' : key === 'indoor' ? '室内' : key === 'tech' ? '科技' : '自然')) {
        return sounds[Math.floor(Math.random() * sounds.length)];
      }
    }

    return '环境声：背景音';
  } else {
    const ambienceMap: Record<string, string[]> = {
      night: ['Ambience: night wind', 'Ambience: crickets', 'Ambience: distant traffic'],
      street: ['Ambience: crowd noise', 'Ambience: traffic', 'Ambience: footsteps'],
      rain: ['Ambience: rain', 'Ambience: thunder', 'Ambience: water drops'],
      indoor: ['Ambience: air conditioning', 'Ambience: footstep echoes', 'Ambience: door sounds'],
      tech: ['Ambience: electrical hum', 'Ambience: machinery', 'Ambience: electronic sounds'],
      nature: ['Ambience: birds', 'Ambience: wind', 'Ambience: flowing water']
    };

    for (const [key, sounds] of Object.entries(ambienceMap)) {
      if (content.includes(key)) {
        return sounds[Math.floor(Math.random() * sounds.length)];
      }
    }

    return 'Ambience: background sound';
  }
}

/**
 * 生成转场
 */
function generateTransition(card: any, transition_style: string, index: number, total: number, isZh: boolean): string {
  // 最后一条不需要转场
  if (index === total - 1) {
    return isZh ? '无' : 'none';
  }

  const content = `${card.lighting_mood} ${card.visual_desc}`.toLowerCase();
  
  // 根据transition_style确定概率分布
  let transitions: string[] = [];
  let weights: number[] = [];

  if (transition_style === 'clean') {
    transitions = ['cut', 'fade'];
    weights = [0.8, 0.2];
  } else if (transition_style === 'cinematic') {
    transitions = ['cut', 'fade', 'flash'];
    weights = [0.6, 0.3, 0.1];
  } else if (transition_style === 'dynamic') {
    transitions = ['cut', 'whip', 'flash', 'glitch'];
    weights = [0.5, 0.25, 0.15, 0.1];
  }

  // 根据lighting_mood/情绪偏置
  const tensionKeywords = isZh
    ? ['紧张', '惊悚', '追逐', '冲突', '危险']
    : ['tense', 'thriller', 'chase', 'conflict', 'danger'];
  
  const softKeywords = isZh
    ? ['抒情', '回忆', '温柔', '柔和', '浪漫']
    : ['lyrical', 'memory', 'gentle', 'soft', 'romantic'];

  const isTension = tensionKeywords.some(kw => content.includes(kw));
  const isSoft = softKeywords.some(kw => content.includes(kw));

  if (isTension) {
    // 偏向cut/whip/flash
    if (transitions.includes('cut')) {
      const cutIndex = transitions.indexOf('cut');
      weights[cutIndex] += 0.1;
    }
    if (transitions.includes('whip')) {
      const whipIndex = transitions.indexOf('whip');
      weights[whipIndex] += 0.05;
    }
  } else if (isSoft) {
    // 偏向fade
    if (transitions.includes('fade')) {
      const fadeIndex = transitions.indexOf('fade');
      weights[fadeIndex] += 0.15;
    }
  }

  // 归一化权重
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  weights = weights.map(w => w / totalWeight);

  // 按权重随机选择
  const rand = Math.random();
  let cumulative = 0;
  for (let i = 0; i < transitions.length; i++) {
    cumulative += weights[i];
    if (rand <= cumulative) {
      return transitions[i];
    }
  }

  return transitions[0];
}

/**
 * 生成字幕要点
 */
function generateCaptionSubtitle(card: any, subtitle_density: string, isZh: boolean): string {
  // 从dialogue_voiceover提取
  let text = '';
  if (card.dialogue_voiceover && card.dialogue_voiceover.trim() && card.dialogue_voiceover !== '（无对白）' && card.dialogue_voiceover !== '(No dialogue)') {
    text = card.dialogue_voiceover.trim();
    
    // 移除"旁白："、"对白："等前缀
    if (isZh) {
      text = text.replace(/^(旁白|对白|角色)：/, '');
    } else {
      text = text.replace(/^(Narration|Dialogue|Character):\s*/, '');
    }
  }

  // 如果没有对白，从visual_desc提取关键词
  if (!text) {
    text = card.visual_desc || '';
  }

  // 根据subtitle_density控制长度
  if (subtitle_density === 'low') {
    // 只保留关键一句（≤12字）
    if (isZh) {
      text = text.substring(0, 12);
    } else {
      const words = text.split(' ').slice(0, 6);
      text = words.join(' ');
    }
  } else if (subtitle_density === 'mid') {
    // 关键句 + 情绪词（≤18字）
    if (isZh) {
      text = text.substring(0, 18);
    } else {
      const words = text.split(' ').slice(0, 10);
      text = words.join(' ');
    }
  } else if (subtitle_density === 'high') {
    // 可多一句提示（≤26字）
    if (isZh) {
      text = text.substring(0, 26);
    } else {
      const words = text.split(' ').slice(0, 15);
      text = words.join(' ');
    }
  }

  if (!text) {
    return isZh ? '（无字幕）' : '(No subtitle)';
  }

  return text;
}
