# ウィングマンくん ドキュメント

## ウィングマンくんについて

ウィングマンくんは、Valorantのカスタムマッチでいろいろ手助けをしてくれるBOTです。ランダムでチーム分けをしたり、ランダムでマップなどを出してくれます。

たまに歌もうたうみたいです。

## 招待URL

[ウィングマンくんを招待する](https://discord.com/oauth2/authorize?client_id=1188759163153682433)

## 権限について

ウィングマンくんが正しく動作するためには、管理者権限が必要です。

### 必要な権限

- **管理者権限**: ウィングマンくんにすべての操作を許可するために、管理者権限を付与してください。

### 権限設定の手順

1. サーバーの管理者権限を持つ人がウィングマンくんをサーバーに招待します。
2. サーバー設定から、新しい役職を作成し、その役職に管理者権限を付与します。
3. 作成した役職をウィングマンくんに割り当てます。これでウィングマンくんは必要な権限を持つことができます。

## 目次

1. [Valorantコマンド](#valorantコマンド)
2. [Musicコマンド](#musicコマンド)
3. [Diceコマンド](#diceコマンド)

---

## 1. Valorantコマンド

### コマンド概要

Valorantコマンドは、ゲーム「Valorant」のための便利な機能を提供します。以下のサブコマンドを含みます。

- map
- agent
- composition
- randomteams

### コマンド詳細

#### `/valo map`

- 説明: マップをランダムに選択します。

#### `/valo agent`

- 説明: エージェントをランダムに選択します（ロール指定可）。
- オプション:
  - `role`: エージェントのロールを指定します。
    - `Duelist`: デュエリスト
    - `Initiator`: イニシエーター
    - `Controller`: コントローラー
    - `Sentinel`: センチネル

#### `/valo composition`

- 説明: ランダムにチーム構成を作成します。
- オプション:
  - `duelist`: デュエリストの人数を指定します。
  - `initiator`: イニシエーターの人数を指定します。
  - `controller`: コントローラーの人数を指定します。
  - `sentinel`: センチネルの人数を指定します。
  - `ban`: BANエージェントを選択するかどうかを指定します。

#### `/valo randomteams`

- 説明: メンバーをランダムでチーム分けします。
- オプション:
  - `attacker` (必須): アタッカーのボイスチャンネルを指定します。
  - `defender` (必須): ディフェンダーのボイスチャンネルを指定します。

### 使用例

/valo map
/valo agent role
/valo composition duelist:2 initiator:1 controller:1 sentinel:1 ban
/valo randomteams attacker:<ボイスチャンネル> defender:<ボイスチャンネル>

---

## 2. Musicコマンド

### コマンド概要

Musicコマンドは、音楽関連の操作を行うためのコマンドです。以下のサブコマンドを提供します。

- play
- disconnect
- search
- recommend

### コマンド詳細

#### `/music play`

- 説明: ボイスチャンネルで音楽を再生します。
- オプション:
  - `shuffle` (必須): プレイリストをランダム再生するかどうかを指定します。
  - `url` (必須): 再生したい音楽またはプレイリストのURLを指定します。

#### `/music disconnect`

- 説明: BOTをボイスチャンネルから切断します。

#### `/music search`

- 説明: 指定されたワードで音楽を検索して再生します。
- オプション:
  - `words` (必須): 検索したいワードを指定します。
  - `type` (必須): 検索対象を指定します。
    - `video`: 動画を検索
    - `playlist`: プレイリストを検索

#### `/music recommend`

- 説明: 指定されたURLから関連のある曲を再生します。
- オプション:
  - `url` (必須): 再生したい音楽またはプレイリストのURLを指定します。

### 使用例

`
/music play shuffle:true url:<URL>`

`/music disconnect`

`/music search words:<検索ワード> type:プレイリストを検索`

`/music recommend url:<URL>`

---

## 3. Diceコマンド

### コマンド概要

Diceコマンドは、以下の2つのサブコマンドを提供します。

- chinchiro
- number

### コマンド詳細

#### `/dice chinchiro`

- 説明: ちんちろができます。
- オプション:
  - `cheat` (任意): trueにするとチートが使えます。絶対456になります。
    - `true`: この力がほしい...!!

#### `/dice number`

- 説明: 1から100までの数字をランダムに出します。

### 使用例

`/dice chinchiro`

`/dice number`
