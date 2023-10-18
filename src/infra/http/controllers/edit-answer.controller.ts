import {
  Body,
  Controller,
  HttpCode,
  // UseGuards,
  BadRequestException,
  Put,
  Param,
} from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-use-decorator'
// import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { EditAnswerUseCase } from '@/domain/forum/application/use-cases/edit-answer'

const editAnswerBodySchema = z.object({
  content: z.string(),
  attachments: z.array(z.string().uuid()).default([]),
})

type EditAnswerBodySchema = z.infer<typeof editAnswerBodySchema>

const bodyValidationPipe = new ZodValidationPipe(editAnswerBodySchema)
@Controller('/answers/:id')
// @UseGuards(JwtAuthGuard)
export class EditAnswerController {
  constructor(private editAnswer: EditAnswerUseCase) {}

  @Put()
  @HttpCode(204)
  async handle(
    @Body(bodyValidationPipe) body: EditAnswerBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('id') answerId: string,
  ) {
    const { content, attachments } = body
    const userId = user.sub

    const result = await this.editAnswer.execute({
      content,
      authorId: userId,
      attachmentsIds: attachments,
      answerId,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
