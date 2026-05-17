# バックエンド追加・拡張推奨 API 仕様書

フロントエンドの Next.js 移行完了に伴い、アプリ内の全機能（タイムライン、マップ、カレンダー、インボックス、およびマイページ周辺機能）を完全に本番稼働させるためにバックエンド側で追加・拡張が必要な API エンドポイントおよび設計仕様を以下にまとめます。

---

## 1. タイムライン機能の拡張

### 1.1 特定ユーザーの投稿一覧取得 API
現在、マイページの「過去の投稿」タブ等で、特定ユーザーに絞り込んだ投稿一覧を取得する際に必要となります。

- **エンドポイント**: `GET /timeline/thread`
- **認証**: 必須 (Authorization Header)
- **クエリパラメータ**:
  - `ownerUserId` (string, 必須): 絞り込む対象のユーザーID
  - `limit` (number, 任意): 取得件数 (デフォルト: 20)
  - `offset` (number, 任意): スキップ件数 (デフォルト: 0)
- **レスポンス (200 OK)**:
  ```json
  [
    {
      "threadId": "thread_abc123",
      "ownerUserId": "user_muscle",
      "ownerName": "筋肉マッチョまん",
      "ownerAvatar": "筋",
      "category": "community",
      "title": "マッチョサークル参加者募集！",
      "content": "薄磯海岸で毎週合同トレーニングを行っています！",
      "createdAt": "2026-05-17T09:00:00Z",
      "replyCount": 5,
      "categoryContent": {
        "url": "http://muscle___instagram",
        "imageUrl": null
      }
    }
  ]
  ```

---

## 2. マイページ（ブックマーク・フォロー）機能の追加

### 2.1 投稿の保存 (ブックマーク) API
マイページの「保存した投稿」タブの表示や、スレッドカード上での保存状態同期に必要となります。

#### 保存の実行
- **エンドポイント**: `POST /user/bookmark`
- **認証**: 必須 (Authorization Header)
- **リクエストボディ**:
  ```json
  {
    "threadId": "thread_abc123"
  }
  ```
- **レスポンス (200 OK)**: `{ "success": true }`

#### 保存の解除
- **エンドポイント**: `DELETE /user/bookmark`
- **認証**: 必須 (Authorization Header)
- **クエリパラメータ / またはリクエストボディ**:
  - `threadId` (string, 必須)
- **レスポンス (200 OK)**: `{ "success": true }`

#### 保存済み投稿の一覧取得
- **エンドポイント**: `GET /user/bookmark`
- **認証**: 必須 (Authorization Header)
- **クエリパラメータ**:
  - `limit` (number, 任意)
  - `offset` (number, 任意)
- **レスポンス (200 OK)**: タイムラインと同様の `Thread[]` 配列構造

---

### 2.2 ユーザーのフォロー API
他ユーザープロフィール画面での「フォローする」機能、およびマイページの「フォロー中」タブの表示に必要となります。

#### フォローの実行
- **エンドポイント**: `POST /user/follow`
- **認証**: 必須 (Authorization Header)
- **リクエストボディ**:
  ```json
  {
    "targetUserId": "user_xyz789"
  }
  ```
- **レスポンス (200 OK)**: `{ "success": true }`

#### フォローの解除
- **エンドポイント**: `DELETE /user/follow`
- **認証**: 必須 (Authorization Header)
- **クエリパラメータ / またはリクエストボディ**:
  - `targetUserId` (string, 必須)
- **レスポンス (200 OK)**: `{ "success": true }`

#### フォロー中ユーザーの一覧取得
- **エンドポイント**: `GET /user/following`
- **認証**: 必須 (Authorization Header)
- **レスポンス (200 OK)**:
  ```json
  [
    {
      "userId": "user_xyz789",
      "userName": "焚き火マスター",
      "imageUrl": null,
      "introduction": "いわきの自然をこよなく愛しています。"
    }
  ]
  ```

---

## 3. プロフィールモデルの拡張

### 3.1 「所属 (affiliation / organization)」フィールドの追加
UIデザイン上で「所属（例: 平三町目）」が頻繁に表示されますが、現在の `UserProfile` モデルにはこれに対応する属性がありません。

- **変更対象モデル / スキーマ**: `UserProfile`
- **追加項目**:
  - `affiliation` (string, 任意): 所属組織・地域・グループ名など
- **対象API**:
  - `GET /user/profile/:userId` (取得時に `affiliation` を追加)
  - `PUT /user/profile` (作成・編集時に `affiliation` を保存可能にする)
