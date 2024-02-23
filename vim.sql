PGDMP  #    ;    
    	    	    {            vim    16.0    16.0 Z    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    16394    vim    DATABASE     w   CREATE DATABASE vim WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Russian_Russia.1251';
    DROP DATABASE vim;
                postgres    false            �            1259    16524 	   SmsTokens    TABLE     �   CREATE TABLE public."SmsTokens" (
    id integer NOT NULL,
    token text,
    expiration_date timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);
    DROP TABLE public."SmsTokens";
       public         heap    postgres    false            �            1259    16523    SmsTokens_id_seq    SEQUENCE     �   CREATE SEQUENCE public."SmsTokens_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public."SmsTokens_id_seq";
       public          postgres    false    228            �           0    0    SmsTokens_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public."SmsTokens_id_seq" OWNED BY public."SmsTokens".id;
          public          postgres    false    227            �            1259    16589    attendanses    TABLE     6  CREATE TABLE public.attendanses (
    id uuid NOT NULL,
    group_id character varying(255),
    date character varying(255),
    in_attendansi boolean,
    status character varying(255) DEFAULT 'active'::character varying,
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone
);
    DROP TABLE public.attendanses;
       public         heap    postgres    false            �            1259    16597    attendansi_students    TABLE     �  CREATE TABLE public.attendansi_students (
    id uuid NOT NULL,
    attendan_id character varying(255),
    attendan_student_status character varying(255),
    student_id character varying(255),
    group_id character varying(255),
    date character varying(255),
    comment character varying(255),
    status character varying(255) DEFAULT 'active'::character varying,
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone
);
 '   DROP TABLE public.attendansi_students;
       public         heap    postgres    false            �            1259    16515 
   blacklists    TABLE       CREATE TABLE public.blacklists (
    id uuid NOT NULL,
    name character varying(255),
    marks integer,
    student_id json,
    status character varying(255) DEFAULT 'active'::character varying,
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone
);
    DROP TABLE public.blacklists;
       public         heap    postgres    false            �            1259    90525    debtors    TABLE     j  CREATE TABLE public.debtors (
    id uuid NOT NULL,
    student_id character varying(255),
    group_id character varying(255),
    amount integer,
    all_summa integer,
    month character varying(255),
    status character varying(255) DEFAULT 'active'::character varying,
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone
);
    DROP TABLE public.debtors;
       public         heap    postgres    false            �            1259    57352    dnd_columns    TABLE       CREATE TABLE public.dnd_columns (
    id uuid NOT NULL,
    name character varying(255),
    items text,
    "order" integer,
    status character varying(255) DEFAULT 'active'::character varying,
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone
);
    DROP TABLE public.dnd_columns;
       public         heap    postgres    false            �            1259    16507 
   dtmcolumns    TABLE       CREATE TABLE public.dtmcolumns (
    id uuid NOT NULL,
    name character varying(255),
    items json,
    "order" integer,
    status character varying(255) DEFAULT 'active'::character varying,
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone
);
    DROP TABLE public.dtmcolumns;
       public         heap    postgres    false            �            1259    16573    exam_student_points    TABLE     �  CREATE TABLE public.exam_student_points (
    id uuid NOT NULL,
    exam_student_id character varying(255),
    exam_id character varying(255),
    block_1 character varying(255),
    block_2 character varying(255),
    block_3 character varying(255),
    block_4 character varying(255),
    block_5 character varying(255),
    student_exam_id integer,
    status character varying(255) DEFAULT 'active'::character varying,
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone
);
 '   DROP TABLE public.exam_student_points;
       public         heap    postgres    false            �            1259    16565    exam_students    TABLE     O  CREATE TABLE public.exam_students (
    id uuid NOT NULL,
    student_id character varying(255),
    student_other_id character varying(255),
    exam_id character varying(255),
    status character varying(255) DEFAULT 'active'::character varying,
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone
);
 !   DROP TABLE public.exam_students;
       public         heap    postgres    false            �            1259    16549    exams    TABLE     B  CREATE TABLE public.exams (
    id uuid NOT NULL,
    name character varying(255),
    date character varying(255),
    summa_self integer,
    summa_other integer,
    status character varying(255) DEFAULT 'active'::character varying,
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone
);
    DROP TABLE public.exams;
       public         heap    postgres    false            �            1259    32768    freeze_students    TABLE        CREATE TABLE public.freeze_students (
    id uuid NOT NULL,
    student_id character varying(255),
    group_id character varying(255),
    start_date character varying(255),
    start_time character varying(255),
    group_student_id character varying(255),
    description text,
    end_date character varying(255),
    end_time character varying(255),
    status character varying(255) DEFAULT 'active'::character varying,
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone
);
 #   DROP TABLE public.freeze_students;
       public         heap    postgres    false            �            1259    16581    group_schedules    TABLE     �  CREATE TABLE public.group_schedules (
    id uuid NOT NULL,
    group_id character varying(255),
    lesson_time character varying(255),
    day_of_week integer,
    teacher_id character varying(255),
    room_id character varying(255),
    status character varying(255) DEFAULT 'active'::character varying,
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone
);
 #   DROP TABLE public.group_schedules;
       public         heap    postgres    false            �            1259    74145    group_students    TABLE     g  CREATE TABLE public.group_students (
    id uuid NOT NULL,
    wallet integer DEFAULT 0,
    student_id character varying(255),
    group_id character varying(255),
    month_payment integer DEFAULT 0,
    status character varying(255) DEFAULT 'active'::character varying,
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone
);
 "   DROP TABLE public.group_students;
       public         heap    postgres    false            �            1259    16415    groups    TABLE     �  CREATE TABLE public.groups (
    id uuid NOT NULL,
    room_id character varying(255),
    name character varying(255),
    wallet integer,
    sale integer,
    month_payment integer,
    count_students character varying(255) DEFAULT '0'::character varying,
    status character varying(255) DEFAULT 'active'::character varying,
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone
);
    DROP TABLE public.groups;
       public         heap    postgres    false            �            1259    16541    lesson_groups    TABLE     �  CREATE TABLE public.lesson_groups (
    id uuid NOT NULL,
    group_id character varying(255),
    lesson_time character varying(255),
    lesson_day character varying(255),
    teacher_id character varying(255),
    room_id character varying(255),
    status character varying(255) DEFAULT 'active'::character varying,
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone
);
 !   DROP TABLE public.lesson_groups;
       public         heap    postgres    false            �            1259    16475    messages    TABLE     I  CREATE TABLE public.messages (
    id uuid NOT NULL,
    student_id character varying(255),
    phone character varying(255),
    group_id character varying(255),
    message character varying(255),
    "time" character varying(255),
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone NOT NULL
);
    DROP TABLE public.messages;
       public         heap    postgres    false            �            1259    16482 	   monthlies    TABLE     1  CREATE TABLE public.monthlies (
    id uuid NOT NULL,
    teacher_id character varying(255),
    payment integer,
    month character varying(255),
    status character varying(255) DEFAULT 'active'::character varying,
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone
);
    DROP TABLE public.monthlies;
       public         heap    postgres    false            �            1259    16440    payments    TABLE     y  CREATE TABLE public.payments (
    id uuid NOT NULL,
    group_student_id character varying(255),
    amount integer,
    teacher_sum integer,
    sale integer,
    status character varying(255) DEFAULT 'active'::character varying,
    debtors_id json,
    debtors_active integer DEFAULT 0,
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone
);
    DROP TABLE public.payments;
       public         heap    postgres    false            �            1259    16498    pendingGroups    TABLE     W  CREATE TABLE public."pendingGroups" (
    id uuid NOT NULL,
    name character varying(255),
    students json,
    count_students character varying(255) DEFAULT '0'::character varying,
    status character varying(255) DEFAULT 'active'::character varying,
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone
);
 #   DROP TABLE public."pendingGroups";
       public         heap    postgres    false            �            1259    16532    rooms    TABLE       CREATE TABLE public.rooms (
    id uuid NOT NULL,
    count_students integer DEFAULT 0,
    name character varying(255),
    status character varying(255) DEFAULT 'active'::character varying,
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone
);
    DROP TABLE public.rooms;
       public         heap    postgres    false            �            1259    16432    sciences    TABLE     �   CREATE TABLE public.sciences (
    id uuid NOT NULL,
    name character varying(255),
    status character varying(255) DEFAULT 'active'::character varying,
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone
);
    DROP TABLE public.sciences;
       public         heap    postgres    false            �            1259    82333    studentPendings    TABLE     {  CREATE TABLE public."studentPendings" (
    id uuid NOT NULL,
    firstname character varying(255),
    gender character varying(255),
    birthday character varying(255),
    lastname character varying(255),
    fathername character varying(255),
    address character varying(255),
    "fatherPhone" character varying(255),
    group_id character varying(255),
    "motherPhone" character varying(255),
    where_user character varying(255),
    class character varying(255),
    status character varying(255) DEFAULT 'active'::character varying,
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone
);
 %   DROP TABLE public."studentPendings";
       public         heap    postgres    false            �            1259    16557    student_others    TABLE     �  CREATE TABLE public.student_others (
    id uuid NOT NULL,
    firstname character varying(255),
    lastname character varying(255),
    fathername character varying(255),
    phone character varying(255),
    class character varying(255),
    science json,
    status character varying(255) DEFAULT 'active'::character varying,
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone
);
 "   DROP TABLE public.student_others;
       public         heap    postgres    false            �            1259    16406    students    TABLE     �  CREATE TABLE public.students (
    id uuid NOT NULL,
    firstname character varying(255),
    gender character varying(255),
    birthday character varying(255),
    lastname character varying(255),
    fathername character varying(255),
    address character varying(255),
    "fatherPhone" character varying(255),
    "motherPhone" character varying(255),
    science json,
    dtmcolumns_id character varying(255),
    status character varying(255) DEFAULT 'active'::character varying,
    blacklist_id json,
    rating character varying(255) DEFAULT 10,
    class character varying(255),
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone
);
    DROP TABLE public.students;
       public         heap    postgres    false            �            1259    16467    teacher_groups    TABLE     $  CREATE TABLE public.teacher_groups (
    id uuid NOT NULL,
    teacher_id character varying(255),
    group_id character varying(255),
    status character varying(255) DEFAULT 'active'::character varying,
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone
);
 "   DROP TABLE public.teacher_groups;
       public         heap    postgres    false            �            1259    16424    teachers    TABLE     �  CREATE TABLE public.teachers (
    id uuid NOT NULL,
    firstname character varying(255),
    lastname character varying(255),
    fathername character varying(255),
    wallet integer,
    gender character varying(255),
    birthday character varying(255),
    address character varying(255),
    phone character varying(255),
    status character varying(255) DEFAULT 'active'::character varying,
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone
);
    DROP TABLE public.teachers;
       public         heap    postgres    false            �            1259    16395    users    TABLE     �  CREATE TABLE public.users (
    id uuid NOT NULL,
    name character varying(255),
    email character varying(255),
    password character varying(255),
    teacher_id character varying(255),
    role character varying(255) DEFAULT 'USER'::character varying,
    status character varying(255) DEFAULT 'active'::character varying,
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone,
    telegram_id character varying(255)
);
    DROP TABLE public.users;
       public         heap    postgres    false            �           2604    16527    SmsTokens id    DEFAULT     p   ALTER TABLE ONLY public."SmsTokens" ALTER COLUMN id SET DEFAULT nextval('public."SmsTokens_id_seq"'::regclass);
 =   ALTER TABLE public."SmsTokens" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    227    228    228            �          0    16524 	   SmsTokens 
   TABLE DATA           [   COPY public."SmsTokens" (id, token, expiration_date, "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    228   ��       �          0    16589    attendanses 
   TABLE DATA           j   COPY public.attendanses (id, group_id, date, in_attendansi, status, "updatedAt", "createdAt") FROM stdin;
    public          postgres    false    236   C�       �          0    16597    attendansi_students 
   TABLE DATA           �   COPY public.attendansi_students (id, attendan_id, attendan_student_status, student_id, group_id, date, comment, status, "updatedAt", "createdAt") FROM stdin;
    public          postgres    false    237   ��       �          0    16515 
   blacklists 
   TABLE DATA           c   COPY public.blacklists (id, name, marks, student_id, status, "updatedAt", "createdAt") FROM stdin;
    public          postgres    false    226   ŉ       �          0    90525    debtors 
   TABLE DATA           w   COPY public.debtors (id, student_id, group_id, amount, all_summa, month, status, "updatedAt", "createdAt") FROM stdin;
    public          postgres    false    242   �       �          0    57352    dnd_columns 
   TABLE DATA           a   COPY public.dnd_columns (id, name, items, "order", status, "updatedAt", "createdAt") FROM stdin;
    public          postgres    false    239   ��       �          0    16507 
   dtmcolumns 
   TABLE DATA           `   COPY public.dtmcolumns (id, name, items, "order", status, "updatedAt", "createdAt") FROM stdin;
    public          postgres    false    225   F�       �          0    16573    exam_student_points 
   TABLE DATA           �   COPY public.exam_student_points (id, exam_student_id, exam_id, block_1, block_2, block_3, block_4, block_5, student_exam_id, status, "updatedAt", "createdAt") FROM stdin;
    public          postgres    false    234   �       �          0    16565    exam_students 
   TABLE DATA           t   COPY public.exam_students (id, student_id, student_other_id, exam_id, status, "updatedAt", "createdAt") FROM stdin;
    public          postgres    false    233   #�       �          0    16549    exams 
   TABLE DATA           j   COPY public.exams (id, name, date, summa_self, summa_other, status, "updatedAt", "createdAt") FROM stdin;
    public          postgres    false    231   @�       �          0    32768    freeze_students 
   TABLE DATA           �   COPY public.freeze_students (id, student_id, group_id, start_date, start_time, group_student_id, description, end_date, end_time, status, "updatedAt", "createdAt") FROM stdin;
    public          postgres    false    238   ]�       �          0    16581    group_schedules 
   TABLE DATA           �   COPY public.group_schedules (id, group_id, lesson_time, day_of_week, teacher_id, room_id, status, "updatedAt", "createdAt") FROM stdin;
    public          postgres    false    235   �       �          0    74145    group_students 
   TABLE DATA           {   COPY public.group_students (id, wallet, student_id, group_id, month_payment, status, "updatedAt", "createdAt") FROM stdin;
    public          postgres    false    240   ��       �          0    16415    groups 
   TABLE DATA           �   COPY public.groups (id, room_id, name, wallet, sale, month_payment, count_students, status, "updatedAt", "createdAt") FROM stdin;
    public          postgres    false    217   �       �          0    16541    lesson_groups 
   TABLE DATA           �   COPY public.lesson_groups (id, group_id, lesson_time, lesson_day, teacher_id, room_id, status, "updatedAt", "createdAt") FROM stdin;
    public          postgres    false    230   �       �          0    16475    messages 
   TABLE DATA           n   COPY public.messages (id, student_id, phone, group_id, message, "time", "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    222   ʙ       �          0    16482 	   monthlies 
   TABLE DATA           e   COPY public.monthlies (id, teacher_id, payment, month, status, "updatedAt", "createdAt") FROM stdin;
    public          postgres    false    223   k�       �          0    16440    payments 
   TABLE DATA           �   COPY public.payments (id, group_student_id, amount, teacher_sum, sale, status, debtors_id, debtors_active, "updatedAt", "createdAt") FROM stdin;
    public          postgres    false    220   �       �          0    16498    pendingGroups 
   TABLE DATA           o   COPY public."pendingGroups" (id, name, students, count_students, status, "updatedAt", "createdAt") FROM stdin;
    public          postgres    false    224   K�       �          0    16532    rooms 
   TABLE DATA           [   COPY public.rooms (id, count_students, name, status, "updatedAt", "createdAt") FROM stdin;
    public          postgres    false    229   h�       �          0    16432    sciences 
   TABLE DATA           N   COPY public.sciences (id, name, status, "updatedAt", "createdAt") FROM stdin;
    public          postgres    false    219   g�       �          0    82333    studentPendings 
   TABLE DATA           �   COPY public."studentPendings" (id, firstname, gender, birthday, lastname, fathername, address, "fatherPhone", group_id, "motherPhone", where_user, class, status, "updatedAt", "createdAt") FROM stdin;
    public          postgres    false    241   ��       �          0    16557    student_others 
   TABLE DATA           �   COPY public.student_others (id, firstname, lastname, fathername, phone, class, science, status, "updatedAt", "createdAt") FROM stdin;
    public          postgres    false    232   ��       �          0    16406    students 
   TABLE DATA           �   COPY public.students (id, firstname, gender, birthday, lastname, fathername, address, "fatherPhone", "motherPhone", science, dtmcolumns_id, status, blacklist_id, rating, class, "updatedAt", "createdAt") FROM stdin;
    public          postgres    false    216   ��       �          0    16467    teacher_groups 
   TABLE DATA           d   COPY public.teacher_groups (id, teacher_id, group_id, status, "updatedAt", "createdAt") FROM stdin;
    public          postgres    false    221   ˡ       �          0    16424    teachers 
   TABLE DATA           �   COPY public.teachers (id, firstname, lastname, fathername, wallet, gender, birthday, address, phone, status, "updatedAt", "createdAt") FROM stdin;
    public          postgres    false    218   �       �          0    16395    users 
   TABLE DATA           {   COPY public.users (id, name, email, password, teacher_id, role, status, "updatedAt", "createdAt", telegram_id) FROM stdin;
    public          postgres    false    215   ʣ       �           0    0    SmsTokens_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public."SmsTokens_id_seq"', 1, true);
          public          postgres    false    227            �           2606    16531    SmsTokens SmsTokens_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public."SmsTokens"
    ADD CONSTRAINT "SmsTokens_pkey" PRIMARY KEY (id);
 F   ALTER TABLE ONLY public."SmsTokens" DROP CONSTRAINT "SmsTokens_pkey";
       public            postgres    false    228                       2606    16596    attendanses attendanses_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.attendanses
    ADD CONSTRAINT attendanses_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.attendanses DROP CONSTRAINT attendanses_pkey;
       public            postgres    false    236                       2606    16604 ,   attendansi_students attendansi_students_pkey 
   CONSTRAINT     j   ALTER TABLE ONLY public.attendansi_students
    ADD CONSTRAINT attendansi_students_pkey PRIMARY KEY (id);
 V   ALTER TABLE ONLY public.attendansi_students DROP CONSTRAINT attendansi_students_pkey;
       public            postgres    false    237            �           2606    16522    blacklists blacklists_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.blacklists
    ADD CONSTRAINT blacklists_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.blacklists DROP CONSTRAINT blacklists_pkey;
       public            postgres    false    226                       2606    90532    debtors debtors_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.debtors
    ADD CONSTRAINT debtors_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.debtors DROP CONSTRAINT debtors_pkey;
       public            postgres    false    242                       2606    57359    dnd_columns dnd_columns_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.dnd_columns
    ADD CONSTRAINT dnd_columns_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.dnd_columns DROP CONSTRAINT dnd_columns_pkey;
       public            postgres    false    239            �           2606    16514    dtmcolumns dtmcolumns_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.dtmcolumns
    ADD CONSTRAINT dtmcolumns_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.dtmcolumns DROP CONSTRAINT dtmcolumns_pkey;
       public            postgres    false    225                       2606    16580 ,   exam_student_points exam_student_points_pkey 
   CONSTRAINT     j   ALTER TABLE ONLY public.exam_student_points
    ADD CONSTRAINT exam_student_points_pkey PRIMARY KEY (id);
 V   ALTER TABLE ONLY public.exam_student_points DROP CONSTRAINT exam_student_points_pkey;
       public            postgres    false    234            �           2606    16572     exam_students exam_students_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.exam_students
    ADD CONSTRAINT exam_students_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.exam_students DROP CONSTRAINT exam_students_pkey;
       public            postgres    false    233            �           2606    16556    exams exams_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.exams DROP CONSTRAINT exams_pkey;
       public            postgres    false    231            	           2606    32775 $   freeze_students freeze_students_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.freeze_students
    ADD CONSTRAINT freeze_students_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.freeze_students DROP CONSTRAINT freeze_students_pkey;
       public            postgres    false    238                       2606    16588 $   group_schedules group_schedules_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.group_schedules
    ADD CONSTRAINT group_schedules_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.group_schedules DROP CONSTRAINT group_schedules_pkey;
       public            postgres    false    235                       2606    74154 "   group_students group_students_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.group_students
    ADD CONSTRAINT group_students_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.group_students DROP CONSTRAINT group_students_pkey;
       public            postgres    false    240            �           2606    16423    groups groups_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.groups DROP CONSTRAINT groups_pkey;
       public            postgres    false    217            �           2606    16548     lesson_groups lesson_groups_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.lesson_groups
    ADD CONSTRAINT lesson_groups_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.lesson_groups DROP CONSTRAINT lesson_groups_pkey;
       public            postgres    false    230            �           2606    16481    messages messages_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.messages DROP CONSTRAINT messages_pkey;
       public            postgres    false    222            �           2606    16489    monthlies monthlies_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.monthlies
    ADD CONSTRAINT monthlies_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.monthlies DROP CONSTRAINT monthlies_pkey;
       public            postgres    false    223            �           2606    16448    payments payments_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.payments DROP CONSTRAINT payments_pkey;
       public            postgres    false    220            �           2606    16506     pendingGroups pendingGroups_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public."pendingGroups"
    ADD CONSTRAINT "pendingGroups_pkey" PRIMARY KEY (id);
 N   ALTER TABLE ONLY public."pendingGroups" DROP CONSTRAINT "pendingGroups_pkey";
       public            postgres    false    224            �           2606    16540    rooms rooms_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.rooms DROP CONSTRAINT rooms_pkey;
       public            postgres    false    229            �           2606    16439    sciences sciences_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.sciences
    ADD CONSTRAINT sciences_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.sciences DROP CONSTRAINT sciences_pkey;
       public            postgres    false    219                       2606    82340 $   studentPendings studentPendings_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public."studentPendings"
    ADD CONSTRAINT "studentPendings_pkey" PRIMARY KEY (id);
 R   ALTER TABLE ONLY public."studentPendings" DROP CONSTRAINT "studentPendings_pkey";
       public            postgres    false    241            �           2606    16564 "   student_others student_others_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.student_others
    ADD CONSTRAINT student_others_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.student_others DROP CONSTRAINT student_others_pkey;
       public            postgres    false    232            �           2606    16414    students students_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.students DROP CONSTRAINT students_pkey;
       public            postgres    false    216            �           2606    16474 "   teacher_groups teacher_groups_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.teacher_groups
    ADD CONSTRAINT teacher_groups_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.teacher_groups DROP CONSTRAINT teacher_groups_pkey;
       public            postgres    false    221            �           2606    16431    teachers teachers_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.teachers DROP CONSTRAINT teachers_pkey;
       public            postgres    false    218            �           2606    16405    users users_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
       public            postgres    false    215            �           2606    16403    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public            postgres    false    215            �   :  x�}�_o�8ş��b�W�lH�a�B	2��?X+�0Ђ1�6� ��k����������_�%5۵q<�?��F���5�Q�O��ZѠ��~Frw�����K�,A;���@����s`�l����w��"�8s�w�_~d�fX(A�Q�=�!�K�0Uv�p�o��ַcV�<��T������@%Z=ߓm*E�ޘ��|�T�#OyW��c�)Rwݜ���[U���^j�=aMTt�5��CՇ/��?
|��kHk���PE�(��oNq���ī1t��
�UZ�Թv�(�U|�0�c�dx�3�$��x�=JX�ȋzNU����s�*��C7�x(T0�I�>Xp?����[$�1�G��K��a��#��X�ј�(�~̜�[�K��m�;#��F$z?�3K0���S�f�B�93	�>�?6$�9�Y�e�ؓ��~�_Jh7��^�oݬ��Ҹ���;�
�����4�����yz�ųV�*6��/��1�'=s���gOe��ʓ��:�,�$�����\
�L�3mN�F�����]5���2���ʨ���kucM34pU���S�=i*�t����Os���(��)�N0vO��̈́ܝ~�����t6�{vs�W����d���fi�f��>�����P�4�J���G]�`p�Ƒ��򦖭�M�3�8{N#PQ�3Z�*��(z��^S}Fz;�ΠӞ�9κ5U���ڈ�7�hg��d�V��B��v�q���/�o����Y�>ijO����ɏ_`��<B�7����&x2�Z���]���������|zxx��^�t      �   O  x�����]1��9O1��A��x����~��7�00����.�?~5�5I�[�T2h5(�$6�Xt�4W�J+2:���#�b��F.@X�u������t�FzK�	����?J�LBVl��d�C8W�U̐����ђt��Ī\��>�90H��M�/M�K'�����0�S��>՜kg�Yc���;"I��q��Ѳ�=��g��3��J���i~�Bħ�	C3w��D�L}R�Ӧ}��Or�7�[�f���_���kt1Ȗ;'�
�M�*�)������>+]�襩ԇi�%��z�Jŵ9݁נѺ}yǟ�o*7���������:��� �@      �     x����n#7�Ϟ�Ƚ`@J�D��c_�I� �Pl{�ӗ�� �=�s1s<�R�Ʈ^�}0���l�+���r"T�	R��h@��r2A�c������O����W�T�[�%���Zsd9����8�s��d0ղ��&������t����?��OOT��g�ϙ����6FoU{L<�'-�<|����p��c������/�:k�� =B�<�uj���ċ�a��֟_��<���x���Sd���Ӗg*8�i�p���a�)�)��bǐ}.����0�,�eXD���y�zr7m*D#�C)\*q��Ҡeiyp�D�d��?A�=0���:HH�;�c!K�
y1mu� �UVJ�ᜎ�WY���:�$�v�E��HNsXm�E5Zq���Sۏ��	�Y�9ѳ����-i�!�WF&�N��ɚb�p� ||k� ,t�b�K�1�,�1���T�����o�[��3x1m����)�g<"��sQ�5X&�� lҰJ^P}F�F�_�R�2W
�C��]���PMXӣe���"�ɥƜ4wߝ��sS�Ie'�A9U����]f�"lC-�#��{��'&�)-��5~��uD�В�!�wӖS�Y2�iĳ�c���F���]��w�C	k�Jx1mi��I	�8�Tq��I���MV̆ci��)�!/��%�u3a��b	Rx��Br�:�ƻ��c	�:�n�ZL	q��1.Z�R�$�N���$e�x&�7N��J-6�T�<���f��3���?I=�>c�@�1m���Wԕew�@{�h�H��MW�� ?�o��岓SŨ9�C"�?اz8oC�"�F���	�x�#Q}c�B_Bl8|p�c�ݓ��+�O1K����!$�oL���b�n��ŃMF�����J-q��e'%��~P�Cjz��!��ᡱ�J���(��c��}����X��6���3�3�sn���iCáQ?q�hA@M�ޕg��q����!�"_&��^�Ks�_��iP0/LdH�}E�H:|���L���۶�z��      �      x������ � �      �     x��V�n#G<k������d��[ra�������1��m��$�ZB���X,R�2�22�j��`:+T���C3ꭐ���@)6��"�AZ		.G�u_^�10��P�ty��C\oT�j�	S�?�5�_��>w����6��93�m�����!��e��Yoh�d���.ІPm�z&��/*PJ��g
�փ�!���;�Ƶ����P�k�:�2w��-S��>�&P0�Cn�&��0i������V~T�ږ��w ��`�	<���R����|��k�Aғ���2ػ�԰ˍ�����{��D�h�U�ĀK�AzTn���.�^�_�@w�L�ڊEŵ8��-r�q��ȱ�,B|��~���v��T�?ЖE+E=�Gy�N��J�._�4nU*����"�U�@�(������`ʻ|��=�Y�o_q�H�h�fNť�5��� �5&�^�c�?@[���0�P^Y�[*��i�a	�.�xj=c�b4s��>&�>��iV��JF�<8���"��	f�<P/k���0�Ƙv1��������?ӑiOE��b�Rz��Z:{(:wd��+�ؔ�z�>:�=�S8i|ҕAs������
�*���+���vD^��X��,�V^���h_���JtQ�Nq}��E�t�E�=�h�b��-�l����"��3b-1Hr��g$V4�8.�#����̢�5{��qG��4kZ~f S��6�X�aO�4��z]�ߗ��BxP~�)��=@����m��{B      �   9  x�uѻNd1����)��@>��K��m�������H � v4��74 Č��/>��V�Yh�U+jӞ�����x�~<��w ��NO��� R<�o�7��ߒ}�p`�(nƫf�i�>�i�*���c��cMM�il#7����BAW��$���F6ӧ��F7�GT����Pʉ���:�=�� �%(�Mqe�	�JK�f�c�V�FC�:E��A�Fw�\ ���sn������I�*�*՝1W��ɩH�.�������? ������E�+-�/�S��aT�K#�>ܛ��%���8�i>Z9_����.�����5      �   �   x��ϽJ1@�:y��e���̤;;;��dwA�X���Z*��)>��v�	B栓�ZBC:6��sf�z\������P����uF� ����t�u�C�'ՉA! Bt	c8B>=tGc�%2/]�K[�o���T���+�~�`p�	M��b��tS���+w�U���u�/k���4Op      �      x������ � �      �      x������ � �      �      x������ � �      �   �  x�}�=��1Dc�����ݞl�@Jb�m		D�8?^`�+2[e=�s������FwhY'��V�c�R�B��@�&��22����fZ$DA�#�>���cE����؀��܅�E�j���c!�[@ߧLΈY[6C)���/�K)=�~��^q�^87k��?�5�z�Qȍ:�8��[�BG�Ԣ9C7���~N�\d��V��}���x�<$�iBƔ=�P��lB_��,��'7^@���R*�Ʃl���,��D0�^7Q�-�ft�i�)��l�ֆ�9�tD�*�EJ���dA�gՖМث�GF',�m�$K�����{l��58H_5i���~?�n\ƴ;�=��\A�&.4��x<��-����7�������p���;�A��      �   �  x������6�뫧H����H��ϒ�������&�)��xp���?��.6�;e0)�me�PIO'V,��ۍ;���X󄡳�9|���(��A��(ja�M��+(���K)s�C����A�0�2���-d۷�����ϿW��
d�?О"O�76���?R��Q��|m�*��ވ�#��:^�O���~I��-�Z�+.����l2��=���]x��XͰB�e��W'����D�\Ǔ���)ݡ��[���(Q<��m����̹�����]p��̿����,*o=��WXS�A��`˽�u�v޹5_R*�Ղ*��G��p�nإz_���N^�	�N�%E���v �{�����`u�4]K���ufT��n�)هu��� d�+5��ى5K�Ҝ;��8~�r���#-�v�^�:���b�ؚ��$>��N��-R�<��>��EY�u�;R�`�ؚ�)�k��u�<�.���h���D�Z���pw���ܚ/)y�eL, 9Glt�3��p�R�M^ǻ#V^��|I	�fm#�1��_��6 ��H��G��j­@ѣ1��3�ǘT�R5ůˬ-��
{�5�1WWq_R�'x���V�|��NJ�i㌑$ߎ1{���ܺ9�1�[���ɓ�}�z�wH�0��1G�>vo�	�Ӧ/��ح��x�����}���NJQ� �)c��2Ü��h�C�x���o�Տ��������#+4��z0\W��}�]��d�|O��)���R�ˎ�      �     x���M�9�׮S�~�DJ��d#Q�M�Y���� A�����xe������c�R*�5Z$�	�*�J��˸�%S[G��˄�AD`����jHo����4J��4�ː5�mva<?���>�3����H�',��SںP�Cx���%[v�iIh,�Egm+�+��J<[o�㌙�)�����z(�&��Җ��L�����k�*u�9j@/�X�dd���y�:������?�x`ޫ�[跥����	!�Y!5Gh\2��T*�d�G��X{���v�)���<N��;%}�n��@�)mS�u�8i8O�e��ur��'ң��#ж����ٳ6-�5�>�B����V��N�Q{�	h��>��҆j��@��Ck���;;�P1R$t�T���������X�-�Ϭ�'=Mvh��=��
���-�����=|$(�P"�	�kz<��iUS�"A���1��`�3µ�;�� >0���A�*m���,�S4r��%�\N�I��!{�Y�D���B��oK[X�Jl�t�����!�c�-u�S�hA����MӘW�o�L��<�w�A�r��^�{Iw��Hj��&5�g�V� ��&�-|�Ƽ�?���Q�vH[D��؊�rb����'c\p:��bP��J���G�?2���}'CνX�Z^�y\�/e`���#�F,L�94��p�=���Bx��;^��ܔ��S�V��|%2�8�t��$��G,������rEv�ޑ���h!��@ڷm���Y�      �     x��нN1���)�#G�c���x�.�:����$ Z*X��~��l�{�X�$7��3C-x�h-����ey���;�_Åqւ��m���>: �Z����=��Fd�8M=i�U�Jl����^�
�<��j\��|�ϗ�|�&���%��$���ƻ;G�hKHIx�:ݚ�lRD�� �A�-��y�`����AWG!��9��]�7S���
5#XnJm��>b�x��1����b�G�#p�$�u��>�u]? �Uq      �   �  x���;�1�z�*N����ĳ�%�P!�Ot��Ѥq��_l�n� h���!q�>:ft=�ǜ� �-͡�3z۷j�iڅX�y�K_~��R�f�t�Ce0��PDƌ�<r-�e�6+�ZƱr�����_�΃�0���qi���`���^�x_b�Փ
��#�͒�âUA�Vh�'��|�Xe��aW�6�A�(	�4`G�5zKߏ�F�F�J{����Z�������M5�TOcy��%{�\[��T��T�]['�fTB:'��ʼ$�0�VX�=ζ
4�^�n��D� ����L�3~V��B��O
��3i�nQ}?0��QW(I�:� Y�M�" U�T{"D�	��6��V�Ei����rxɲJ�h��X�!$�eNs���͉ӽ�������f~<��7��k      �   �  x���;nA��SthˮqUwU?6#�@"qҏ�ȖW�=����B�3�ވ#K6�� g���~}�*Re�.���0�	�brTS+d���*Vއ	87�T���LB�-!���>�x���P��+��|���f��MU�.[���ɬ�W"��˷G(�������~��������뻩�W��y�����_v��ן���j)B���jǀq�}$bh1{��W�Ӭ�	��ƕ�J2��7���Ӹϵn����ߋ�gӒ#$�m�2�\p�Jj�7�V!f��)����$BN˳�`j�&۽�\'[8X�l�9��9��}�bQ/���Ev��V8��	F�$�(1��Yc&LTqv��2�m�?�Ƴ�z��OO��[ư"�7���=J���t��7MJ�      �   p   x�}�;1����+�$޳�8^�D�8?��y�h4o	������lIBh�X9�O/�!�:BƼN�&����E�H+��]`���z��h��F���$��vG���c��~ <#�      �   P  x���ˮ�6�מ�f�r@���*m�Ь�vS��K眤��AZ��Ӧ���)�JK�@����A�k�v!�QZWP[��AlU�l6��9>����s��u�0����Nּ�l=3�N��R��L�<J������?���9���_SV��P�]�w�;Ӎ�~B�A�B�L{6`���BGg0�N{k�1wĪI/xI����Q�Sn�/L_�v��i���w��ܱު����]�� �b�R���j��k�Q{&��L�Ü2��v
f
��cL�Iq�Ke�Ϛ/�%���
���V�%������j^�)���; :�[������@��JA�'���f#M/M�y8Ok�#��Sd�sO�ܥ�������3���w��{n�K?o�U��Ru�8m��	�y�=A���o���Ѕy̡%;�E9}�Лm
�e��˱�gC$�4O��� d��Q%��;��	��P"�#�����"1�����p\�7Wy�{%����l�$�V�cG�~�Zc;�>��i�2d�D�S��W���͓@���- {z�k�e������Cl�>���Q��[ )w�>�=�.��.��?�E$6      �      x������ � �      �   �   x�u�;N�@��:s��#?g�9	�';�h�A��E���q��m��`!�:�mv�Lc�H�\����������\Y �o��f��?�]�r�-Z6�PP�;�	�"�U��!�?��ݨm�7�s;��T���&;�� ����\ܝ){M]�~,���V�tj���i⬠�1無I(���m�_K.,ߐVS=������{�X�����i�0�m���p����"[�ʩu��R� �0{�      �      x������ � �      �      x������ � �      �      x������ � �      �   �  x���Ko�0��ίȮT�D����]	$*������7(��_�o��҇@����̜�[5�l�ZW�cE���Q�$���p�k,[Q�m�
�RC{ŧ����η��~��L����ˣ�����ھ��u�M��{׿��׆���C�����Q��d��'��`%#9���i�n��x/P��HRk�}�4���I��|��.Y����!����jRȅ�8�w��(A* �W�,��ْ�(}�P
c����I����&~����~d?*;8���q���HO&7�(�k3�@21��K)���s�+Ɇצ�	u�̵�����m��F���0����d>%�`��G�Q��;��d���K�U[S�=�ސ2V�b5��x;o����Q�ww����2�l�+���ͨ�H<hi(T�8�$W�h`2��TF�l))*-NO�5���n�?,�*�J!���4O�'p�	,"�#�bڽ@�&k�{xa��82�6�@q1t]����      �   ;  x���9��@�X:E�
\K��2	Y0�#��:10n������oQOA�<�i	��Pkfx�~v�zv�h�� ����L{+�1c�����9&T�j�����ׯ�1� P<�/�K�h�h��v��	�^��ސsE��=k���O��@s(�L�^�n萙�}��K�����/�#Z�j�.�=��b�ĝe��{��r�D2�7��Q>��:��Z'˽��\X��m�����v!]�����3�K��Z������aQA��fz��� :辑<�D�'�F�a�^�� ����CU�Y_������7Pڧ[      �   �   x��;�0@g�� !Wv��W(+K�_����D��brA;�}�+��Sw!��5+_���g�o��i��}�cyL3mn��h��?0A���	���-��P�R����g��j0[���΢:$��ʸ�:Y�L���p/������+Rd5l{[UhE����6M��1�      �   L  x���KSAF��+\�K�p��=�����8�W����a�_HŨ�IV����wN����ȑ��N!Md��6��eث��u���lY;%���j��Z��F�N��//uxJ�|Y�"|Y]����0a�)Ʒ7��K�q�m�[3���B� �4���똓���"�AHN��u��-�cĔ��*���znLА9~,��|�~	|�7��<r�ŋ��=˟#�0����U�?B��+���^�V��{#6=L7Si+zZS!�Ә��ʈ�3���+,	�C���P�E�(��ak�`a���y�����]}���"YE��6�˭:3�N�&�����E�|9n�C.c�"��'�o#% X�ARa��Hf�!��@��<�c�ׯ脼��j��jr~���7�O���p�ei��ž�l�=��f:n��՜qTi(8�F�c��	�Rt��MC�AP-��"��;����u�x-�9Kn$�ZZmC�
��l��^�~��c=]��嶀UweB�[ݐ�����Ŭ�_��f[N.�yZP�ɛ1o�1  '�c�c��Ư�yt������O֣I     