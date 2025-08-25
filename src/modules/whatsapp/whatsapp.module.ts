import { Module } from "@nestjs/common";
import { WhatsAppMessageService } from "./whatsapp-message.service";
import { WhatsAppMessagesController } from "./whatsapp-messages.controller";
import { WhatsappController } from "./whatsapp.controller";
import { WhatsappService } from "./whatsapp.service";
import { WhatsAppSSEController } from "./whatsapp-sse.controller";
import { WhatsAppEventEmitterService } from "../../common/services/whatsapp-event-emitter.service";
import { SSEService } from "../../common/services/sse.service";
import { EventEmitterModule } from "@nestjs/event-emitter";

@Module({
  imports: [
    EventEmitterModule.forRoot(),
  ],
  controllers: [
    WhatsappController, 
    WhatsAppMessagesController, 
    WhatsAppSSEController
  ],
  providers: [
    WhatsappService, 
    WhatsAppMessageService,
    WhatsAppEventEmitterService,
    SSEService
  ],
})
export class WhatsappModule {}