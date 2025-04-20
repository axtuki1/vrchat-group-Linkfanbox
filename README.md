# Fanbox-relationship-linker-for-VRChatGroup

名前は適当.....  

FANBOXの支援者情報をVRChatのグループロールとリンクさせるやつです。

## 使い方

`config`フォルダ内の`template.json`を`config.json`へリネームします。
```
$ cp ./config/template.json ./config/config.json
(mvでも可)
```

`config.json`内の設定項目を入力します。

- 対象グループのID  
  (ttps://vrchat.com/home/group/grp_xxxx... の `grp_xxxx...` の部分)
- 各種アカウント情報  
  (VRChatは新規アカウントを推奨します)
- 支援プラン情報
- グループに紐付くロールID

必要なライブラリのインストールとビルドを行います。

```
$ yarn
$ yarn build
```

ビルドが完了したら実行します。

```
$ yarn start
```

## おことわり

関係サーバに迷惑を掛けないようにね

