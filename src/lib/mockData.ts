// 模拟数据 - 用于初始化 localStorage

import type { User, News, Link, Work } from '@/types';

// 模拟用户数据
export const mockUsers: User[] = [
  {
    id: 'u1',
    nickname: '创作者1',
    email: 'creator1@example.com',
    password_hash: 'simplehash123', // 注意：仅演示用途，不安全
    membership_tier: 'free',
    created_ms: 1672531200000
  }
];

// 模拟新闻数据
export const mockNews: News[] = [
  {
    id: 'n1',
    title: '漫剧行业新趋势',
    summary: '探讨2026年漫剧行业发展新方向',
    content: '本文分析了漫剧行业在技术、内容、商业模式等方面的新变化。随着AI技术的发展，漫剧创作工具日益智能化，创作者可以更高效地完成从剧本到成片的全流程制作。同时，观众对高质量内容的需求不断提升，推动行业向精品化方向发展。',
    tags: ['行业趋势', '技术发展'],
    author_id: 'u1',
    created_ms: 1672531200000
  },
  {
    id: 'n2',
    title: '知名工作室推出新作',
    summary: 'XX工作室宣布启动新项目',
    content: 'XX工作室是国内领先的漫剧制作团队，拥有丰富的创作经验和专业的制作能力。本次新项目将采用全新的叙事手法和视觉风格，为观众带来耳目一新的观看体验。项目预计将于今年下半年正式上线。',
    tags: ['工作室动态', '新项目'],
    author_id: 'u1',
    created_ms: 1672617600000
  },
  {
    id: 'n3',
    title: '融资消息',
    summary: 'YY公司获得新一轮融资',
    content: 'YY公司是一家专注于漫剧内容制作和发行的创业公司，近日宣布完成新一轮融资。本轮融资由知名投资机构领投，融资金额达数千万元。公司表示，本轮融资将主要用于内容制作、技术研发和团队扩充，进一步提升公司的市场竞争力。',
    tags: ['融资', '资本动态'],
    author_id: 'u1',
    created_ms: 1672704000000
  }
];

// 模拟友情链接数据
export const mockLinks: Link[] = [
  {
    id: 'l1',
    name: '动漫之家',
    url: 'https://www.dongmanhome.com',
    desc: '综合性动漫资讯平台',
    tags: ['资讯', '社区'],
    author_id: 'u1',
    created_ms: 1672531200000
  },
  {
    id: 'l2',
    name: '快看漫画',
    url: 'https://www.kuaikanmanhua.com',
    desc: '热门漫画阅读平台',
    tags: ['漫画', '阅读'],
    author_id: 'u1',
    created_ms: 1672617600000
  },
  {
    id: 'l3',
    name: '哔哩哔哩',
    url: 'https://www.bilibili.com',
    desc: '视频分享平台，包含大量漫剧内容',
    tags: ['视频', '漫剧'],
    author_id: 'u1',
    created_ms: 1672704000000
  }
];

// 模拟作品数据
export const mockWorks: Work[] = [
  {
    id: 'w1',
    type: 'script',
    title: '示例剧本：校园爱情',
    content: {
      acts: [
        {
          act_number: 1,
          scenes: [
            {
              scene_number: 1,
              location: '学校操场',
              characters: ['女主角', '男主角'],
              dialogues: [
                {
                  speaker: '女主角',
                  line: '喂，你又在发呆啊'
                },
                {
                  speaker: '男主角',
                  line: '啊，没事儿，just thinking'
                }
              ],
              actions: [
                '女主角走过来，轻拍男主角肩膀',
                '男主角回过神，露出微笑'
              ],
              camera_suggestions: '中景镜头，展现两人互动'
            }
          ]
        }
      ]
    },
    author_id: 'u1',
    lang: 'zh',
    created_ms: 1672531200000,
    updated_ms: 1672531200000
  }
];

// 初始化所有模拟数据
export function initMockData(): void {
  // 动态导入避免循环依赖
  import('./tableApi').then(({ default: tableApi }) => {
    // 初始化各表数据
    tableApi.initTable('users', mockUsers);
    tableApi.initTable('news', mockNews);
    tableApi.initTable('links', mockLinks);
    tableApi.initTable('works', mockWorks);
  });
}
