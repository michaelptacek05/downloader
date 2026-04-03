import { NextRequest, NextResponse } from "next/server";
import Ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";
import { create } from "youtube-dl-exec";

const isMac = process.platform === "darwin";
const ytDlpPath = isMac ? "/opt/homebrew/bin/yt-dlp" : "/usr/local/bin/yt-dlp";
const ffmpegPath = isMac ? "/opt/homebrew/bin/ffmpeg" : "/usr/bin/ffmpeg";

const youtubedl = create(ytDlpPath);
Ffmpeg.setFfmpegPath(ffmpegPath);

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "no url" }, { status: 400 });
    }

    try {
        console.log("ziskavam data");
        const info = await youtubedl(url, {
            dumpSingleJson: true,
            format: "bestaudio/best",
            username: process.env.YT_USERNAME || "oauth2",
            password: process.env.YT_PASSWORD || "",
            noWarnings: true,
            cookies: "./cookies.txt",
            userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
            noCheckCertificates: true,
        } as any);

        const directAudioUrl =
            (info as any).url ||
            (info as any).formats?.filter((f: any) => f.url).pop()?.url;

        if (!directAudioUrl) {
            throw new Error("Nepodařilo se získat přímou adresu streamu.");
        }

        const title = (info as any).title.replace(/[^\w\s]/gi, "");

        console.log(`proslo to, stahuju: ${title}`);

        const passThrough = new PassThrough();

        Ffmpeg(directAudioUrl)
            .audioBitrate(192)
            .format("mp3")
            .pipe(passThrough)
            .on("error", (err: Error) =>
                console.error("chyba konverze:", err.message),
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
        console.error("spadlo to na:", errorMessage);
        return NextResponse.json(
            { error: "je to v pytli", detail: errorMessage },
            { status: 500 },
        );
    }
}
