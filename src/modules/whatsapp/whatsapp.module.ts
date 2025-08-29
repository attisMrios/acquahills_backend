import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { SSEService } from "../../common/services/sse.service";
import { WhatsAppEventEmitterService } from "../../common/services/whatsapp-event-emitter.service";
import { WhatsappMediaController } from "./whatsapp-media.controller";
import { WhatsAppMessageService } from "./whatsapp-message.service";
import { WhatsAppMessagesController } from "./whatsapp-messages.controller";
import { WhatsAppSSEController } from "./whatsapp-sse.controller";
import { WhatsappController } from "./whatsapp.controller";
import { WhatsappService } from "./whatsapp.service";

@Module({
  imports: [
    EventEmitterModule.forRoot(),
  ],
  controllers: [
    WhatsappController, 
    WhatsAppMessagesController, 
    WhatsAppSSEController,
    WhatsappMediaController
  ],
  providers: [
    WhatsappService, 
    WhatsAppMessageService,
    WhatsAppEventEmitterService,
    SSEService
  ],
})
export class WhatsappModule {}