const { router } = require("../../routing/Router");
const fs = require('fs');
const path = require('path');

router.routingMap.addRoute("/", router.routingMap.getHandler('/index'));

router.post('/upload', (req, res) => {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.startsWith('multipart/form-data')) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Expected multipart/form-data' }));
        return;
    }

    const boundaryMatch = contentType.match(/boundary=(.*)$/);
    if (!boundaryMatch) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No boundary in multipart/form-data' }));
        return;
    }
    const boundary = Buffer.from('--' + boundaryMatch[1]);

    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
        const body = Buffer.concat(chunks);

        // Split body into parts by boundary
        const parts = [];
        let idx = body.indexOf(boundary);
        while (idx !== -1) {
            const start = idx + boundary.length;
            // skip possible CRLF after boundary
            let partStart = start;
            if (body[partStart] === 13 && body[partStart + 1] === 10) partStart += 2;
            const nextIdx = body.indexOf(boundary, partStart);
            if (nextIdx === -1) break;
            const part = body.slice(partStart, nextIdx - 2); // remove trailing CRLF before next boundary
            if (part.length) parts.push(part);
            idx = nextIdx;
        }

        // Find file part (looks for filename in Content-Disposition)
        let savedFiles = [];
        for (const part of parts) {
            const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
            if (headerEnd === -1) continue;
            const headerBuf = part.slice(0, headerEnd);
            const contentBuf = part.slice(headerEnd + 4);

            const headerStr = headerBuf.toString('utf8');
            const dispositionMatch = headerStr.match(/Content-Disposition: form-data; name="([^"]+)"(?:; filename="([^"]+)")?/i);
            if (!dispositionMatch) continue;

            const originalFilename = dispositionMatch[2];
            if (!originalFilename) continue; // not a file field

            // build filename using original name plus current time
            const ext = path.extname(originalFilename) || '';
            const basename = path.basename(originalFilename, ext);
            const filename = `${basename}_${Date.now()}${ext}`;

            // determine static directory path based on router.basePath
            // router.basePath may be e.g. '/public' or '/'
            const base = (router.basePath || '/').replace(/^\//, '');
            const staticDir = path.join(base || '.', 'src/user/static/upload');
            try {
                fs.mkdirSync(staticDir, { recursive: true });
                const filePath = path.join(staticDir, filename);
                fs.writeFileSync(filePath, contentBuf);
                savedFiles.push({
                    field: dispositionMatch[1],
                    originalName: originalFilename,
                    savedName: filename,
                    url: path.posix.join(router.basePath || '/', 'static/upload', filename)
                });
            } catch (err) {
                console.error('Upload save error:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to save file' }));
                return;
            }
        }

        if (savedFiles.length === 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No file uploaded' }));
            return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, files: savedFiles }));
    });

    req.on('error', (err) => {
        console.error('Request error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Request error' }));
    });
});