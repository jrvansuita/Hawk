const fs = require('fs');
const path = require('path')
const { google } = require('googleapis');
const GDriveConnect = require('./gdrive-connect');

module.exports = class GDriveApi {
    logThis() {
        console.log(this);
    }

    setMedia(file) {
        this.fileMetadata = { name: file.name, parents: [Params.getGDriveFolder()] }
        this.file = {
            mimeType: file.mimetype,
            body: fs.createReadStream(file.tempFilePath)
        }
        return this
    }

    upload(callback) {
        new GDriveConnect().go((auth) => {
            this.drive = google.drive({ version: 'v3', auth });

            this.drive.files.create({
                resource: this.fileMetadata,
                media: this.file,
                fields: 'id, name, webViewLink'
            }, function (err, file) {
                if (err) {
                    console.error(err);
                } else {
                    console.log(file.data);
                    callback(file.data);
                }
            });
        })
    }

    delete(fileId, callback) {
        new GDriveConnect().go((auth) => {
            this.drive = google.drive({ version: 'v3', auth });

            this.drive.files.delete({
                fileId: fileId
            }, function (err, file) {
                if (err) {
                    console.error(err);
                } else {
                    console.log('Anexo Excluído');
                    callback()
                }
            });
        })
    }
}
