import { cn } from '@/lib/utils';
import { User } from '@/types/store';
import { Link } from '@inertiajs/react';

const UserCardLink = ({ user }: { user: User }) => {
  return (
    <Link
      key={user.id}
      href={`/admin/users/${user.id}`}
      className="flex flex-col overflow-hidden rounded border border-gray-400 shadow hover:shadow-md"
    >
      <div className="flex gap-2 p-2">
        <div className="flex-1">
          <div className="flex items-center gap-x-1.5 text-slate-600">
            <p className="font-bold">
              {user.fname} {user.lname}
            </p>
          </div>
          <p className="text-xs">{user.email}</p>
        </div>

        <div className="flex flex-none flex-col gap-1">
          <p className={cn('aspect-square h-2 rounded-full', user.isBlocked ? 'bg-rose-500' : 'bg-green-600')}></p>
        </div>
      </div>
      <div className="mt-auto flex justify-between border-t border-gray-300 bg-gray-100 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-gray-600">
        <p>
          ID:
          {user.id < 10 ? `0${user.id}` : user.id}
        </p>
        <p>{user.memberSince}</p>
      </div>
    </Link>
  );
};

export default UserCardLink;
