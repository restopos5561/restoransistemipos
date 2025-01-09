import { Request, Response } from 'express';
import { prisma } from '../app';
import { OptionGroupNotFoundError, OptionNotFoundError, InvalidOptionGroupError } from '../errors/option-errors';
import { BadRequestError } from '../errors/bad-request-error';

export const getProductOptions = async (req: Request, res: Response) => {
  const { productId } = req.params;

  const optionGroups = await prisma.productOptionGroup.findMany({
    where: {
      productId: Number(productId),
    },
    include: {
      options: true,
    },
  });

  res.json({
    success: true,
    data: optionGroups,
  });
};

export const addOptionGroup = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { name, isRequired, minQuantity, maxQuantity } = req.body;

  if (minQuantity > maxQuantity) {
    throw new InvalidOptionGroupError('Minimum seçim sayısı maksimum seçim sayısından büyük olamaz');
  }

  const optionGroup = await prisma.productOptionGroup.create({
    data: {
      productId: Number(productId),
      name,
      isRequired,
      minQuantity,
      maxQuantity,
    },
  });

  res.status(201).json({
    success: true,
    data: optionGroup,
  });
};

export const addOption = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { optionGroupId, name, priceAdjustment } = req.body;

  const optionGroup = await prisma.productOptionGroup.findFirst({
    where: {
      id: Number(optionGroupId),
      productId: Number(productId),
    },
  });

  if (!optionGroup) {
    throw new OptionGroupNotFoundError(Number(optionGroupId));
  }

  if (priceAdjustment < 0) {
    throw new BadRequestError('Fiyat farkı 0 veya daha büyük olmalıdır');
  }

  const option = await prisma.productOption.create({
    data: {
      optionGroupId: Number(optionGroupId),
      productId: Number(productId),
      name,
      priceAdjustment,
    },
  });

  res.status(201).json({
    success: true,
    data: option,
  });
};

export const updateOption = async (req: Request, res: Response) => {
  const { productId, optionId } = req.params;
  const { name, priceAdjustment } = req.body;

  const option = await prisma.productOption.findFirst({
    where: {
      id: Number(optionId),
      productId: Number(productId),
    },
  });

  if (!option) {
    throw new OptionNotFoundError(Number(optionId));
  }

  if (priceAdjustment < 0) {
    throw new BadRequestError('Fiyat farkı 0 veya daha büyük olmalıdır');
  }

  const updatedOption = await prisma.productOption.update({
    where: {
      id: Number(optionId),
    },
    data: {
      name,
      priceAdjustment,
    },
  });

  res.json({
    success: true,
    data: updatedOption,
  });
};

export const deleteOption = async (req: Request, res: Response) => {
  const { productId, optionId } = req.params;

  const option = await prisma.productOption.findFirst({
    where: {
      id: Number(optionId),
      productId: Number(productId),
    },
  });

  if (!option) {
    throw new OptionNotFoundError(Number(optionId));
  }

  await prisma.productOption.delete({
    where: {
      id: Number(optionId),
    },
  });

  res.json({
    success: true,
    message: 'Seçenek başarıyla silindi',
  });
}; 