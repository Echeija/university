-- Users Table
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    phone TEXT,
    role TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for searching users
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

-- Applicants Table
CREATE TABLE public.applicants (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    dob DATE,
    address TEXT,
    nationality TEXT,
    program_of_interest TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for searching applicants
CREATE INDEX idx_applicants_user_id ON public.applicants(user_id);
CREATE INDEX idx_applicants_program ON public.applicants(program_of_interest);

-- Applications Status Table
CREATE TABLE public.applications_status (
    id SERIAL PRIMARY KEY,
    applicant_id INTEGER NOT NULL REFERENCES public.applicants(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' NOT NULL,
    reviewer_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
    comments TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for filtering application statuses
CREATE INDEX idx_applications_status_applicant_id ON public.applications_status(applicant_id);
CREATE INDEX idx_applications_status_status ON public.applications_status(status);

-- Payments Table
CREATE TABLE public.payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount DOUBLE PRECISION NOT NULL,
    purpose TEXT NOT NULL,
    reference TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for payments
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_reference ON public.payments(reference);
