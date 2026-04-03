import { NextRequest, NextResponse } from "next/server";
import Ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";
import { create } from "youtube-dl-exec";

const isMac = process.platform === 'darwin';
const ytDlpPath = isMac ? '/opt/homebrew/bin/yt-dlp' : '/usr/local/bin/yt-dlp';
const ffmpegPath = isMac ? '/opt/homebrew/bin/ffmpeg' : '/usr/bin/ffmpeg';

const youtubedl = create(ytDlpPath);
Ffmpeg.setFfmpegPath(ffmpegPath);

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "Chybí URL" }, { status: 400 });
    }

    try {
        console.log("Získávám data přes systémový yt-dlp...");
        const info = await youtubedl(url, {
            dumpSingleJson: true,
            format: "bestaudio",
            noWarnings: true,
            cookies: "./cookies.txt", 
        } as any);

        const title = info.title.replace(/[^\w\s]/gi, "");
        const directAudioUrl = (info as any).url;

        console.log(`Úspěch! Stahuji: ${title}`);

        const passThrough = new PassThrough();

        Ffmpeg(directAudioUrl)
            .audioBitrate(192)
            .format("mp3")
            .pipe(passThrough)
            .on("error", (err: Error) =>
                console.error("Chyba při konverzi:", err.message),
            );

        const webStream = new ReadableStream<Uint8Array>({
            start(controller) {
                passThrough.on("data", (chunk: Uint8Array) =>
                    controller.enqueue(chunk),
                );
                passThrough.on("end", () => controller.close());
                passThrough.on("error", (err: Error) => controller.error(err));
            },
        });

        return new Response(webStream, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Content-Disposition": `attachment; filename="${title}.mp3"`,
            },
        });
    } catch (error: any) {
        const errorMessage = error?.stderr || error?.message || String(error);
        console.error("Spadlo to na:", errorMessage);
        return NextResponse.json(
            { error: "Je to v pytli", detail: errorMessage },
            { status: 500 },
        );
    }
}
