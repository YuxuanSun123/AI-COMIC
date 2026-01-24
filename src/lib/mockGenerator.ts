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
