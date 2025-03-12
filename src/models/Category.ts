import mongoose, { Schema, Document } from 'mongoose';

export interface ISubContent extends Document {
  title: string;
  icon: string;
  description?: string;
  content?: string;
  color?: string;
}

export interface ICategory extends Document {
  name: string;
  description: string;
  icon?: string;
  color?: string;
  isRecommended?: boolean;
  subContents?: ISubContent[];
  createdAt: Date;
  updatedAt: Date;
}

const SubContentSchema = new Schema<ISubContent>(
  {
    title: {
      type: String,
      required: [true, 'Název sub-contentu je povinný'],
      trim: true,
      maxlength: [50, 'Název sub-contentu nemůže být delší než 50 znaků'],
    },
    icon: {
      type: String,
      required: [true, 'Ikona je povinná'],
      default: 'academic-cap',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Popis sub-contentu nemůže být delší než 200 znaků'],
    },
    content: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      default: '#f8a287',
    },
  }
);

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Název kategorie je povinný'],
      trim: true,
      maxlength: [100, 'Název kategorie nemůže být delší než 100 znaků'],
    },
    description: {
      type: String,
      required: [true, 'Popis kategorie je povinný'],
      trim: true,
      maxlength: [500, 'Popis kategorie nemůže být delší než 500 znaků'],
    },
    icon: {
      type: String,
      default: 'academic-cap',
    },
    color: {
      type: String,
      default: '#f8a287',
    },
    isRecommended: {
      type: Boolean,
      default: false,
    },
    subContents: [SubContentSchema],
  },
  {
    timestamps: true,
  }
);

// Pokud model již existuje, použijeme ho, jinak vytvoříme nový
export const Category = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema); 