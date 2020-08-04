const fs = require('fs');
const path = require('path')
const { google } = require('googleapis');
const GDriveConnect = require('./gdrive-connect');

module.exports = class GDriveApi {
    logThis() {
        console.log(this);
    }

    setMedia(fileName, filePath, fileType) {
        this.fileMetadata = { name: fileName, parents: [Params.getGDriveFolder()] }
        this.file = {
            mimeType: fileType,
            body: fs.createReadStream(filePath)
        }
        return this
    }

    upload(callback) {
        new GDriveConnect().callGDriveApi((auth) => {
            this.drive = google.drive({ version: 'v3', auth });

            this.drive.files.create({
                resource: this.fileMetadata,
                media: this.file,
                fields: 'id'
            }, function (err, file) {
                if (err) {
                    console.error(err);
                } else {
                    callback(file.data.id);
                }
            });
        })
    }

    download(fileId, callback) {
        new GDriveConnect().callGDriveApi((auth) => {
            this.drive = google.drive({ version: 'v3', auth });

            this.drive.files.get({ fileId: fileId }, (_err1, file) => {
                if (_err1) {
                    console.log(_err1);
                    return;
                }

                var dest = fs.createWriteStream(path.join(__dirname) + '/' + file.data.name);
                this.drive.files.get({
                    fileId: fileId,
                    alt: 'media',
                }, { responseType: 'stream' }, function (_err, res) {
                    if (_err) console.log(_err); else {
                        res.data
                            .on('end', () => {
                                console.log('Done');
                            })
                            .on('error', err => {
                                console.log('Error', err);
                            })
                            .pipe(dest);
                    }
                })
            });
        });
    }

    createFolder(folderName, callback) {
        var fileMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder'
        };
        this.GDriveConnect((auth) => {
            this.drive = google.drive({ version: 'v3', auth });

            this.drive.files.create({
                resource: fileMetadata,
                fields: 'id'
            }, function (err, folder) {
                if (err) {
                    console.error(err);
                } else {
                    if (callback) callback(folder.id)
                }
            });
        });
    }
}
