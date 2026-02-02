import {
  Controller,
  Get,
  Post,
  Param,
  Sse,
  Res,
  MessageEvent,
} from "@nestjs/common";
import { Response } from "express";
import { Observable, map, takeUntil, Subject, interval, merge } from "rxjs";
import { ArchitectService, ReviewStreamEvent } from "./architect.service";

@Controller("projects/:projectId/reviews")
export class ArchitectController {
  constructor(private readonly architectService: ArchitectService) {}

  @Get()
  getReviews(@Param("projectId") projectId: string) {
    return this.architectService.getReviews(projectId);
  }

  @Get(":reviewId")
  getReview(
    @Param("projectId") projectId: string,
    @Param("reviewId") reviewId: string,
  ) {
    return this.architectService.getReview(projectId, reviewId);
  }

  @Post("trigger")
  triggerReview(@Param("projectId") projectId: string) {
    return this.architectService.triggerReview(projectId);
  }

  @Sse("subscribe")
  subscribeToReviews(
    @Param("projectId") projectId: string,
    @Res() res: Response,
  ): Observable<MessageEvent> {
    const closeSubject = new Subject<void>();

    res.on("close", () => {
      closeSubject.next();
      closeSubject.complete();
    });

    // Heartbeat every 30 seconds
    const heartbeat$ = interval(30000).pipe(
      map(() => ({ data: { type: "heartbeat", timestamp: Date.now() } })),
    );

    // Review events
    const events$ = this.architectService.getReviewStream(projectId).pipe(
      map((event: ReviewStreamEvent) => ({
        data: event,
      })),
    );

    return merge(heartbeat$, events$).pipe(
      takeUntil(closeSubject),
      map(
        (event) => ({ data: JSON.stringify(event.data) }) as MessageEvent,
      ),
    );
  }
}
