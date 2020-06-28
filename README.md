# [Hawk](https://hawkproject.herokuapp.com/) [Prod] [![CodeFactor](https://www.codefactor.io/repository/github/jrvansuita/hawk/badge?s=6dc2de9a8a50bdc0f1b72cae64e4eba7596e73cb)](https://www.codefactor.io/repository/github/jrvansuita/hawk)  [![jest](https://jestjs.io/img/jest-badge.svg)](https://github.com/facebook/jest)

Este é o repositorio de **PRODUÇÃO** do Hawk.

``` npm run start ```

# [Hawk](https://hawkdev.herokuapp.com) [Dev]

Este é o repositório de desenvolvimento do Hawk.

``` npm run dev ```

## Commit
 >*Simplificado via npm command ```npm run git -- "Message"```*

 1. Atualizar o repositório local com as últimas alterações comitadas pelos colegas.

     ``` git pull ```

 2. Fazer o stage e comitar todos os arquivos alterados.

     ``` git add -A && git commit -m "Alguma Mensagem" ```

 3. Fazer o envio das alterações locais para o repositório

     ``` git push ```


## Release

Todo commit neste branch gera uma deploy automatico em:

 1. Push tag cria uma nova release.

     ``` git tag -a v1.0? -m "Mensagem da release"  ```

     ``` git push --tags ```


## Dev Stack

#### Code Edit & Style


- [Visual Studio Code](https://code.visualstudio.com/)
- [Eslint](https://github.com/eslint/eslint) (run: ```npm run linta```, fix: ```npm run lintfa```)
- [Stylelint](https://github.com/stylelint/stylelint) (run: ```npm run slinta```, fix: ```npm run slintfa```)
- [EditorConfig](https://editorconfig.org/)
- [Prettier](https://prettier.io/)


on settings.json:

```json
"javascript.suggestionActions.enabled": false,
"html.validate.scripts": false,
"editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.fixAll.stylelint": true
  }
```

PS.: Fix all possible linting problems: ```npm run fix```

## Unit & Integration Tests

- [Jest](https://github.com/facebook/jest) (run: ```npm test```)



# Merging branch dev->master

1. Ir para o branch master ```git checkout master```
2. Fazer o merge do branch dev -> master ```git merge dev```
3. Juntar todos os commits a frente do dev no master ```git push```


# Merge (Remote Ahead)

  1. Pressionar <kbd>I</kbd>, e colocar a sua mensagem.
  2. Pressionar <kbd>Esc</kbd>, digitar :wq e pressionar <kbd>Enter</kbd>.


# [Hawk API](hawk-api.surge.sh)

  O Hawk possui uma API própria para utilização de apps de terceiros. Essa documentação fica localizada dentro da pasta ***_apidocs***.
  Esta pasta é gerada automaticamente pela bliblioeca [APIDOC](https://apidocjs.com/). Em resumo, é necessário enviar algumas credenciais (access, pass e appkey) para autenticação de usuário e do app para qualquer call de exposta na api. A documentação de API do Hawk é pública e fica hospedada em https://hawk-api.surge.sh.

  1. Atualizar localmente a documentação: ```npm run apidoc```
  2. Publicar a documentação: ```npm run apidoc-surge```
