import { Play, Player, Arrow, ScreenMarker, PlayStep } from './types';

// Helper builders for compact notation
const o = (id: string, num: number, x: number, y: number): Player =>
  ({ id, type: 'offense', number: num, x, y });

const d = (id: string, num: number, x: number, y: number): Player =>
  ({ id, type: 'defense', number: num, x, y });

const pa = (id: string, x1: number, y1: number, x2: number, y2: number): Arrow =>
  ({ id, type: 'pass', x1, y1, x2, y2 });

const ca = (id: string, x1: number, y1: number, x2: number, y2: number): Arrow =>
  ({ id, type: 'cut', x1, y1, x2, y2 });

const da = (id: string, x1: number, y1: number, x2: number, y2: number): Arrow =>
  ({ id, type: 'dribble', x1, y1, x2, y2 });

const sc = (id: string, x: number, y: number, rot: number, ghost = false): ScreenMarker =>
  ({ id, x, y, rotation: rot, ghost });

const step = (id: string, players: Player[], arrows: Arrow[] = [], screens: ScreenMarker[] = []): PlayStep =>
  ({ id, players, arrows, screens });

const now = '2024-01-01T00:00:00.000Z';

// ----------------------------------------------------------------
// Court reference (500×470, basket at top-center):
//   Basket:   (250, 55)
//   Paint:    x 170–330, y 0–190
//   Elbows:   (185, 190)  (315, 190)
//   FT line:  y=190
//   3pt arc apex (center): (250, 293)
//   Corners 3pt: (30,144) and (470,144)
//   Half-court: y=470
// ----------------------------------------------------------------

export const DEFAULT_PLAYS: Play[] = [

  // ===============================================================
  // HALFCOURT
  // ===============================================================

  {
    id: 'tpl-horns',
    name: 'ホーンズ (Horns)',
    category: 'halfcourt',
    description:
      'エルボーに2人のビッグを並べるセット。PnR・アイソ・ハイローなど多彩な展開が可能。NBA/大学で最も多用されるセットのひとつ。',
    thumbnail: '',
    createdAt: now,
    updatedAt: now,
    steps: [
      // Step 1 — Formation
      step('tpl-horns-s1', [
        o('h-p1', 1, 250, 360),   // PG top of key
        o('h-p2', 2, 415, 268),   // SG right wing
        o('h-p3', 3, 85,  268),   // SF left wing
        o('h-p4', 4, 315, 188),   // PF right elbow
        o('h-p5', 5, 185, 188),   // C  left elbow
      ]),
      // Step 2 — PG passes to right elbow; C dives to low post; PG cuts opposite
      step('tpl-horns-s2', [
        o('h-p1', 1, 250, 360),
        o('h-p2', 2, 415, 268),
        o('h-p3', 3, 85,  268),
        o('h-p4', 4, 315, 188),
        o('h-p5', 5, 185, 188),
      ], [
        pa('h-a1', 250, 360, 315, 188),   // O1 → O4 (pass to elbow)
        ca('h-a2', 185, 188, 190, 68),    // O5 dives to low post
        ca('h-a3', 250, 360, 130, 290),   // O1 cuts away (give & go)
      ]),
    ],
  },

  {
    id: 'tpl-pnr',
    name: 'ピック＆ロール (Pick & Roll)',
    category: 'halfcourt',
    description:
      'ボールスクリーンの基本。PGがスクリナーを使って右へドライブ、スクリナーはゴールへロールする。',
    thumbnail: '',
    createdAt: now,
    updatedAt: now,
    steps: [
      step('tpl-pnr-s1', [
        o('pnr-p1', 1, 220, 360),   // PG (will dribble right)
        o('pnr-p2', 2, 420, 260),   // SG right wing
        o('pnr-p3', 3, 80,  260),   // SF left wing
        o('pnr-p4', 4, 270, 305),   // C setting screen near PG
        o('pnr-p5', 5, 450, 135),   // PF weak-side corner
      ]),
      step('tpl-pnr-s2', [
        o('pnr-p1', 1, 340, 295),   // PG turns corner
        o('pnr-p2', 2, 420, 260),
        o('pnr-p3', 3, 80,  260),
        o('pnr-p4', 4, 320, 145),   // C rolls to basket
        o('pnr-p5', 5, 450, 135),
      ], [
        da('pnr-a1', 220, 360, 340, 295),   // O1 dribbles off screen
        ca('pnr-a2', 270, 305, 320, 130),   // O4 rolls
      ], [
        sc('pnr-sc1', 268, 325, 0),          // Screen symbol
      ]),
    ],
  },

  {
    id: 'tpl-5out',
    name: '5アウトモーション',
    category: 'halfcourt',
    description:
      '全員3Pライン外に広がるモーションオフェンス。スペーシングを最大化し、パス後のバスケットカットで得点を狙う。',
    thumbnail: '',
    createdAt: now,
    updatedAt: now,
    steps: [
      step('tpl-5out-s1', [
        o('5o-p1', 1, 250, 368),   // PG top
        o('5o-p2', 2, 412, 258),   // SG right wing
        o('5o-p3', 3, 88,  258),   // SF left wing
        o('5o-p4', 4, 448, 140),   // PF right corner
        o('5o-p5', 5, 52,  140),   // C  left corner
      ]),
      step('tpl-5out-s2', [
        o('5o-p1', 1, 250, 368),
        o('5o-p2', 2, 412, 258),
        o('5o-p3', 3, 88,  258),
        o('5o-p4', 4, 448, 140),
        o('5o-p5', 5, 52,  140),
      ], [
        pa('5o-a1', 250, 368, 412, 258),   // O1 → O2
        ca('5o-a2', 250, 368, 250, 68),    // O1 basket cut after pass
        ca('5o-a3', 52,  140, 250, 368),   // O5 fills up top
      ]),
    ],
  },

  {
    id: 'tpl-zipper',
    name: 'ジッパーカット (Zipper)',
    category: 'halfcourt',
    description:
      'コーナーのウィングがレーン沿いにエルボーへカット(ジッパー)。スクリーンを使ってオープンを作る。',
    thumbnail: '',
    createdAt: now,
    updatedAt: now,
    steps: [
      step('tpl-zip-s1', [
        o('z-p1', 1, 250, 370),   // PG with ball at top
        o('z-p2', 2, 450, 132),   // SG in right corner (will cut)
        o('z-p3', 3, 88,  268),   // SF left wing
        o('z-p4', 4, 315, 188),   // PF right elbow (pins down for O2)
        o('z-p5', 5, 250, 78),    // C low post
      ]),
      step('tpl-zip-s2', [
        o('z-p1', 1, 250, 370),
        o('z-p2', 2, 318, 205),   // SG catches at elbow
        o('z-p3', 3, 88,  268),
        o('z-p4', 4, 315, 188),
        o('z-p5', 5, 250, 78),
      ], [
        ca('z-a1', 450, 132, 318, 205),   // O2 zips up along lane
        pa('z-a2', 250, 370, 318, 205),   // O1 → O2 at elbow
      ], [
        sc('z-sc1', 315, 200, 90),         // Pin-down screen
      ]),
    ],
  },

  {
    id: 'tpl-highlow',
    name: 'ハイロー (High-Low)',
    category: 'halfcourt',
    description:
      'ハイポスト(FTライン)でボールを受けてローポストへダンプパス。インサイドアタックの基本。',
    thumbnail: '',
    createdAt: now,
    updatedAt: now,
    steps: [
      step('tpl-hl-s1', [
        o('hl-p1', 1, 250, 370),   // PG
        o('hl-p2', 2, 418, 258),   // SG
        o('hl-p3', 3, 82,  258),   // SF
        o('hl-p4', 4, 250, 188),   // PF high post (FT line center)
        o('hl-p5', 5, 250, 75),    // C  low post
      ]),
      step('tpl-hl-s2', [
        o('hl-p1', 1, 250, 370),
        o('hl-p2', 2, 418, 258),
        o('hl-p3', 3, 82,  258),
        o('hl-p4', 4, 250, 188),
        o('hl-p5', 5, 250, 75),
      ], [
        pa('hl-a1', 250, 370, 250, 188),   // O1 → O4 (high post entry)
        pa('hl-a2', 250, 188, 250, 75),    // O4 → O5 (high-low dump)
      ]),
    ],
  },

  {
    id: 'tpl-floppy',
    name: 'フロッピー (Floppy)',
    category: 'halfcourt',
    description:
      '両エルボーにスクリーンを並べてシューターが好きな方向へ飛び出す。スリーポイントシューターを活かすセット。',
    thumbnail: '',
    createdAt: now,
    updatedAt: now,
    steps: [
      step('tpl-flop-s1', [
        o('f-p1', 1, 250, 370),   // PG with ball
        o('f-p2', 2, 250, 78),    // Shooter at low post (starting point)
        o('f-p3', 3, 82,  262),   // SF left wing
        o('f-p4', 4, 185, 188),   // PF left elbow screen
        o('f-p5', 5, 315, 188),   // C  right elbow screen
      ]),
      step('tpl-flop-s2', [
        o('f-p1', 1, 250, 370),
        o('f-p2', 2, 412, 258),   // Shooter pops right
        o('f-p3', 3, 82,  262),
        o('f-p4', 4, 185, 188),
        o('f-p5', 5, 315, 188),
      ], [
        ca('f-a1', 250, 78, 412, 258),    // O2 cuts off right screen
        pa('f-a2', 250, 370, 412, 258),   // O1 → O2 (open shooter)
      ], [
        sc('f-sc1', 315, 200, 90),         // Right elbow screen
        sc('f-sc2', 185, 200, 90, true),   // Left elbow screen (ghost — not used this time)
      ]),
    ],
  },

  {
    id: 'tpl-dho',
    name: 'DHO (ドリブルハンドオフ)',
    category: 'halfcourt',
    description:
      'ドリブルしながら味方にボールを手渡す。ディフェンスのスイッチを強制し、ミスマッチを作る基本テクニック。',
    thumbnail: '',
    createdAt: now,
    updatedAt: now,
    steps: [
      step('tpl-dho-s1', [
        o('dho-p1', 1, 250, 360),   // PG top
        o('dho-p2', 2, 415, 260),   // SG right wing
        o('dho-p3', 3, 85,  260),   // SF left wing
        o('dho-p4', 4, 315, 188),   // PF right elbow
        o('dho-p5', 5, 250, 78),    // C  low post
      ]),
      step('tpl-dho-s2', [
        o('dho-p1', 1, 250, 360),
        o('dho-p2', 2, 315, 188),   // SG cuts to elbow to receive DHO
        o('dho-p3', 3, 85,  260),
        o('dho-p4', 4, 415, 260),   // PF flares to wing after DHO
        o('dho-p5', 5, 250, 78),
      ], [
        da('dho-a1', 315, 188, 315, 215),   // PF dribbles toward O2
        ca('dho-a2', 415, 260, 315, 188),   // SG cuts to receive DHO
        ca('dho-a3', 315, 188, 415, 260),   // PF flares away after handoff
      ]),
    ],
  },

  // ===============================================================
  // ENDLINE (エンドライン)
  // ===============================================================

  {
    id: 'tpl-end-box',
    name: 'エンドライン ボックス (Box)',
    category: 'endline',
    description:
      'ボックスフォーメーションからのエンドラインインバウンズ。スクリーンで1人を解放してパスを受けさせる。',
    thumbnail: '',
    createdAt: now,
    updatedAt: now,
    steps: [
      step('tpl-eb-s1', [
        o('eb-p5', 5, 250, 8),     // Inbounder at baseline (out of bounds)
        o('eb-p1', 1, 315, 85),    // High right
        o('eb-p2', 2, 185, 85),    // High left
        o('eb-p3', 3, 315, 35),    // Low right
        o('eb-p4', 4, 185, 35),    // Low left
      ]),
      step('tpl-eb-s2', [
        o('eb-p5', 5, 250, 8),
        o('eb-p1', 1, 315, 85),
        o('eb-p2', 2, 88, 178),    // O2 pops out to left wing
        o('eb-p3', 3, 315, 35),
        o('eb-p4', 4, 185, 35),
      ], [
        ca('eb-a1', 185, 85, 88, 178),   // O2 cuts to wing off screen
        pa('eb-a2', 250, 8,  88, 178),   // O5 inbounds to O2
      ], [
        sc('eb-sc1', 185, 88, 0),         // O1 screens for O2
      ]),
    ],
  },

  {
    id: 'tpl-end-stack',
    name: 'エンドライン スタック (Stack)',
    category: 'endline',
    description:
      '縦1列(スタック)フォーメーション。一斉に散らばって複数のオプションを同時に作り出す。',
    thumbnail: '',
    createdAt: now,
    updatedAt: now,
    steps: [
      step('tpl-es-s1', [
        o('es-p1', 1, 250, 8),    // Inbounder
        o('es-p2', 2, 250, 75),   // Top of stack
        o('es-p3', 3, 250, 52),   // Middle
        o('es-p4', 4, 250, 30),   // Bottom of stack
        o('es-p5', 5, 420, 148),  // Weak-side spacer
      ]),
      step('tpl-es-s2', [
        o('es-p1', 1, 250, 8),
        o('es-p2', 2, 110, 175),  // O2 cuts left
        o('es-p3', 3, 390, 175),  // O3 cuts right
        o('es-p4', 4, 250, 162),  // O4 pops straight up
        o('es-p5', 5, 420, 148),
      ], [
        ca('es-a1', 250, 75, 110, 175),   // O2 cuts left
        ca('es-a2', 250, 52, 390, 175),   // O3 cuts right
        ca('es-a3', 250, 30, 250, 162),   // O4 pops up
        pa('es-a4', 250, 8,  390, 175),   // Inbound to O3
      ]),
    ],
  },

  // ===============================================================
  // SIDELINE (サイドライン)
  // ===============================================================

  {
    id: 'tpl-sl-box',
    name: 'サイドライン ボックス (Box)',
    category: 'sideline',
    description:
      'サイドラインからのボックスフォーメーション。スクリーンを使って素早くインバウンズする。',
    thumbnail: '',
    createdAt: now,
    updatedAt: now,
    steps: [
      step('tpl-slb-s1', [
        o('slb-p1', 1, 5,   250),   // Inbounder at left sideline
        o('slb-p2', 2, 118, 192),   // High near
        o('slb-p3', 3, 118, 308),   // Low near
        o('slb-p4', 4, 278, 192),   // High far
        o('slb-p5', 5, 278, 308),   // Low far
      ]),
      step('tpl-slb-s2', [
        o('slb-p1', 1, 5,   250),
        o('slb-p2', 2, 118, 192),
        o('slb-p3', 3, 195, 368),   // O3 cuts toward half court
        o('slb-p4', 4, 278, 192),
        o('slb-p5', 5, 278, 308),
      ], [
        ca('slb-a1', 118, 308, 195, 368),   // O3 cuts
        pa('slb-a2', 5,   250, 118, 192),   // Inbound to O2
      ], [
        sc('slb-sc1', 118, 308, 0),          // O4 screens for O3
      ]),
    ],
  },

  {
    id: 'tpl-sl-ram',
    name: 'サイドライン RAM',
    category: 'sideline',
    description:
      'スクリーン・オン・ザ・スクリーナー(RAM)を使ったサイドラインセット。シューターをスクリーンの連続でフリーにする。',
    thumbnail: '',
    createdAt: now,
    updatedAt: now,
    steps: [
      step('tpl-ram-s1', [
        o('ram-p1', 1, 5,   205),   // Inbounder
        o('ram-p2', 2, 245, 220),   // Shooter in middle
        o('ram-p3', 3, 378, 308),   // Far wing
        o('ram-p4', 4, 198, 350),   // RAM screener
        o('ram-p5', 5, 352, 182),   // Second screener
      ]),
      step('tpl-ram-s2', [
        o('ram-p1', 1, 5,   205),
        o('ram-p2', 2, 380, 152),   // Shooter pops to right wing
        o('ram-p3', 3, 378, 308),
        o('ram-p4', 4, 198, 350),
        o('ram-p5', 5, 352, 182),
      ], [
        ca('ram-a1', 245, 220, 380, 152),   // O2 cuts off screen chain
        pa('ram-a2', 5,   205, 380, 152),   // Inbound to O2
      ], [
        sc('ram-sc1', 298, 188, 45),
      ]),
    ],
  },
];

export const TEMPLATE_IDS = new Set(DEFAULT_PLAYS.map((p) => p.id));
