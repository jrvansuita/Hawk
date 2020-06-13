# Hawk [DEV]

Este é o repositório de desenvolvimento do Hawk.

## Commit

 1. Atualizar o repositório local com as últimas alterações comitadas pelos colegas.
   - ``` git pull ```

 2. Fazer o stage e comitar todos os arquivos alterados.
   - ``` git commit -a -m "Minhas alterações" ```

 3. Fazer o envio das alterações locais para o repositório
   - ``` git push ```



## Release

Todo commit neste branch gera uma deploy automatico em: https://hawkdev.herokuapp.com

 1. Push de tag (v*) cria uma nova release. É utilizado o github action [create-release@v1](.github/workflows/tags-to-release.yml).

 - ``` git tag -a v1.0? -m "Mensagem da release"  ```



