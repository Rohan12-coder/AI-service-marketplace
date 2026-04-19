import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  icon: string;         // icon name (Lucide icon key) or emoji
  description: string;
  color: string;        // hex color for UI theming
  image: string;        // category hero image URL
  isActive: boolean;
  order: number;        // display order
  serviceCount: number; // virtual / cached
  parentCategory?: mongoose.Types.ObjectId;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type:      String,
      required:  [true, 'Category name is required'],
      unique:    true,
      trim:      true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type:      String,
      required:  [true, 'Slug is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },
    icon: {
      type:    String,
      default: 'Wrench',
    },
    description: {
      type:      String,
      default:   '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    color: {
      type:    String,
      default: '#D4AF37',
      match:   [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color'],
    },
    image: {
      type:    String,
      default: '',
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
    order: {
      type:    Number,
      default: 0,
      min:     0,
    },
    serviceCount: {
      type:    Number,
      default: 0,
      min:     0,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref:  'Category',
    },
    metaTitle: {
      type:      String,
      maxlength: 160,
    },
    metaDescription: {
      type:      String,
      maxlength: 320,
    },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ isActive: 1, order: 1 });
CategorySchema.index({ name: 'text' });

// ── Pre-validate: auto-generate slug ─────────────────────────────────────────
CategorySchema.pre<ICategory>('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

const Category: Model<ICategory> = mongoose.model<ICategory>('Category', CategorySchema);
export default Category;
