# [Hawk](https://hawkproject.herokuapp.com/) [Prod]

 [![CodeFactor](https://www.codefactor.io/repository/github/jrvansuita/hawk/badge?s=6dc2de9a8a50bdc0f1b72cae64e4eba7596e73cb)](https://www.codefactor.io/repository/github/jrvansuita/hawk)

Este é o repositorio de **PRODUÇÃO** do Hawk.

``` npm run start ```

# [Hawk](https://hawkdev.herokuapp.com) [Dev]

Este é o repositório de desenvolvimento do Hawk.

``` npm run dev ```

----

## Commit

 1. Atualizar o repositório local com as últimas alterações comitadas pelos colegas.

    ``` git pull ```

 2. Fazer o stage e comitar todos os arquivos alterados.

    ``` git commit -a -m "Minhas alterações" ```

 3. Fazer o envio das alterações locais para o repositório

    ``` git push ```


## Release

Todo commit neste branch gera uma deploy automatico em:

 1. Push tag cria uma nova release.

  ``` git tag -a v1.0? -m "Mensagem da release"  ```

  ``` git push --tags ```

----

## Dev Stack

#### Style Guide

- IDE VSCode
- Eslint
- Stylelint
- EditorConfig
- Prettier


on settings.json:

```
"javascript.suggestionActions.enabled": false,
"html.validate.scripts": false,


"editor.codeActionsOnSave": {
    // For ESLint
    "source.fixAll.eslint": true,
    // For Stylelint
    "source.fixAll.stylelint": true
  }
```

