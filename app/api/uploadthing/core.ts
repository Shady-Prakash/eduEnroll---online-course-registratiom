import { auth } from "@clerk/nextjs";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { isTeacher } from "@/lib/roles";

const f = createUploadthing();

const handleAuth = () => {
  const {userId, orgRole} = auth();

  if (!userId) throw new UploadThingError("You must be signed in to upload files.");
  if (!isTeacher(orgRole)) {
    throw new UploadThingError(
      "Only teachers can upload files. If you are a teacher, sign out and back in so your organization role is loaded."
    );
  }
  return{userId};
}
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  courseImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    // Set permissions and file types for this FileRoute
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),
  // campaignImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
  //   .middleware(() => handleAuth())
  //   .onUploadComplete(() => {}),
  courseAttachment: f(["text", "image", "video", "audio","pdf"])
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),
  chapterVideo: f({ video: { maxFileCount:1, maxFileSize: "512GB" } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),
  // Caption files (.vtt / .srt). Browsers report inconsistent MIME types for these,
  // so accept small generic files and validate the extension in the captions API.
  chapterCaptions: f({ blob: { maxFileCount: 1, maxFileSize: "1MB" } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {})
     
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;