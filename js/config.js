// アプリケーション設定データ
const appConfig = {
  siteTitle: 'Webアプリ集',
  siteDescription: '便利なWebアプリケーションの一覧',
  footer: '© 2026 taktak apps',
  
  collections: [
    {
      id: 'web-apps',
      title: 'Web Apps',
      subcategories: [
        {
          name: 'Notepad',
          apps: [
            { 
              name: 'ブラウザメモ帳', 
              description: 'タイトルとテキストを自動保存できるシンプルなメモ帳です。', 
              path: 'simplenotepad/' 
            },
            { 
              name: '4分割メモ帳', 
              description: '4つの独立したメモ欄を持つシンプルなメモアプリです。', 
              path: 'fournotepads/' 
            },
            { 
              name: 'マークダウンビューアー', 
              description: 'リアルタイムでマークダウンをプレビューできます。', 
              path: 'markdownviewer/' 
            }
          ]
        },
        {
          name: 'プレゼン',
          apps: [
            { 
              name: 'カウントダウンタイマー', 
              description: '終了時刻や分数を指定してカウントダウンを表示します。', 
              path: 'countdowntimer/' 
            },
            { 
              name: 'プログレスバー', 
              description: '残り時間を視覚的に表示します。', 
              path: 'progressbar/' 
            }
          ]
        },
        {
          name: '参加者',
          apps: [
            { 
              name: 'ランダム抽選ルーレット', 
              description: '抽選で参加者に番号を割り当てます。', 
              path: 'roulette/' 
            },
            { 
              name: 'カウンター付き名簿', 
              description: '参加者ごとの発言回数などをカウントします。', 
              path: 'registerwithcounter/' 
            }
          ]
        },
        {
          name: 'Meeting',
          apps: [
            { 
              name: 'Zoom表示名ジェネレーター', 
              description: 'Zoomミーティングに好きな表示名で参加できるリンクを生成します。', 
              path: 'zoomlink/' 
            }
          ]
        },
        {
          name: 'その他',
          apps: [
            { 
              name: 'Amazon URL クリーナー', 
              description: '長いAmazonリンクをシンプルなURLに変換します。', 
              path: 'amazonurl/' 
            },
            { 
              name: '株式リンクジェネレーター', 
              description: '銘柄コードから主要な投資情報サイトへのリンクを生成します。', 
              path: 'stockinformation/' 
            }
          ]
        }
      ]
    }
  ],
  
  specialCollections: [
    {
      name: 'iPad Apps',
      description: 'iPadのフルスクリーン表示に最適化された、さまざまなアプリケーション集です。',
      path: 'ipad/index.html'
    }
  ]
};
